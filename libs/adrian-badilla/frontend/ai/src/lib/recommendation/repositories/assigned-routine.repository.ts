import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from '@angular/fire/firestore';
import { from, map, Observable, of, switchMap } from 'rxjs';
import type { Exercise } from '@admin/exercise-library';
import type { RoutineDay, RoutineExercise } from '@admin/routine-builder';
import type { RoutineRecommendationResult } from '../models/routine-recommendation-result.model';
import type {
  AssignedRoutine,
  AssignedRoutineCreatePayload,
  AssignedRoutineDay,
  AssignedRoutineDayCreatePayload,
  AssignedRoutineExercise,
  AssignedRoutineExerciseCreatePayload,
} from '../models/assigned-routine.model';

type AssignedRoutineDocument = Omit<AssignedRoutine, 'id' | 'days'>;
type AssignedRoutineDayDocument = Omit<AssignedRoutineDay, 'id' | 'exercises'>;
type AssignedRoutineExerciseDocument = Omit<AssignedRoutineExercise, 'id'>;

function exerciseDurationMinutes(slot: RoutineExercise): number {
  const averageReps = (slot.repsMin + slot.repsMax) / 2;
  const activeSecondsPerSet = averageReps * 4;
  const totalSeconds = slot.sets * (activeSecondsPerSet + slot.restSeconds);
  return totalSeconds / 60;
}

function assignedRoutinesCollectionPath(userId: string): [string, ...string[]] {
  return ['users', userId, 'assigned-routines'];
}

function assignedRoutineDaysCollectionPath(
  userId: string,
  assignmentId: string
): [string, ...string[]] {
  return ['users', userId, 'assigned-routines', assignmentId, 'days'];
}

function assignedRoutineExercisesCollectionPath(
  userId: string,
  assignmentId: string,
  dayId: string
): [string, ...string[]] {
  return [
    'users',
    userId,
    'assigned-routines',
    assignmentId,
    'days',
    dayId,
    'exercises',
  ];
}

function createResolvedExerciseLookup(recommendation: RoutineRecommendationResult) {
  return new Map<string, Exercise>(
    recommendation.candidate.resolvedExercises.map((item) => [
      `${item.dayId}:${item.slot.exId}`,
      item.exercise,
    ])
  );
}

function assignedRoutinePayload(
  userId: string,
  recommendation: RoutineRecommendationResult
): AssignedRoutineCreatePayload {
  const now = serverTimestamp();

  return {
    userId,
    routineTemplateId: recommendation.routineTemplate.id,
    source: 'recommendation_engine',
    recommendationScore: recommendation.score,
    normalizedScore: recommendation.normalizedScore,
    recommendationReasons: recommendation.reasons,
    warnings: recommendation.warnings,
    penalties: recommendation.penalties,
    requiredAdaptations: recommendation.requiredAdaptations,
    status: 'active',
    assignedAt: now,
    startedAt: null,
    completedAt: null,
    templateSnapshot: recommendation.routineTemplate,
    updatedAt: now,
    deactivatedAt: null,
  };
}

function assignedRoutineDayPayload(day: RoutineDay): AssignedRoutineDayCreatePayload {
  return {
    dayId: day.dayId,
    dayName: day.name,
    order: day.order,
    estimatedDuration: Math.round(
      day.exercises.reduce((sum, slot) => sum + exerciseDurationMinutes(slot), 0)
    ),
    exerciseCount: day.exercises.length,
  };
}

function assignedRoutineExercisePayload(
  resolvedExerciseLookup: Map<string, Exercise>,
  day: RoutineDay,
  slot: RoutineExercise
): AssignedRoutineExerciseCreatePayload {
  const resolvedExercise = resolvedExerciseLookup.get(`${day.dayId}:${slot.exId}`);

  return {
    originalExerciseId: slot.exerciseId,
    exerciseId: resolvedExercise?.id ?? slot.exerciseId,
    nameSnapshot: resolvedExercise?.name ?? '',
    thumbnailUrlSnapshot: resolvedExercise?.thumbnailUrl ?? '',
    order: slot.order,
    sets: slot.sets,
    repsMin: slot.repsMin,
    repsMax: slot.repsMax,
    restSeconds: slot.restSeconds,
    rir: slot.rir,
    tempo: slot.tempo,
    notes: slot.notes,
    status: 'pending',
  };
}

@Injectable({ providedIn: 'root' })
export class AssignedRoutineRepository {
  readonly #db = inject(Firestore);

  assignTopRecommendation(
    userId: string,
    recommendation: RoutineRecommendationResult
  ): Observable<string> {
    const collectionRef = collection(
      this.#db,
      ...assignedRoutinesCollectionPath(userId)
    );
    const activeAssignmentsQuery = query(
      collectionRef,
      where('status', '==', 'active')
    );

    return from(getDocs(activeAssignmentsQuery)).pipe(
      switchMap((snapshot) => {
        const assignmentRef = doc(collectionRef);
        const batch = writeBatch(this.#db);
        const timestamp = serverTimestamp();
        const resolvedExerciseLookup = createResolvedExerciseLookup(recommendation);

        for (const snapshotDoc of snapshot.docs) {
          batch.update(snapshotDoc.ref, {
            status: 'inactive',
            updatedAt: timestamp,
            deactivatedAt: timestamp,
          });
        }

        batch.set(assignmentRef, assignedRoutinePayload(userId, recommendation));

        for (const day of recommendation.routineTemplate.days) {
          const dayRef = doc(
            this.#db,
            ...assignedRoutineDaysCollectionPath(userId, assignmentRef.id),
            day.dayId
          );

          batch.set(dayRef, assignedRoutineDayPayload(day));

          const exercisesCollectionRef = collection(
            this.#db,
            ...assignedRoutineExercisesCollectionPath(
              userId,
              assignmentRef.id,
              day.dayId
            )
          );

          for (const slot of day.exercises) {
            const exerciseRef = doc(exercisesCollectionRef);

            batch.set(
              exerciseRef,
              assignedRoutineExercisePayload(resolvedExerciseLookup, day, slot)
            );
          }
        }

        return from(batch.commit()).pipe(map(() => assignmentRef.id));
      })
    );
  }

  getActiveAssignedRoutine(userId: string): Observable<AssignedRoutine | null> {
    const collectionRef = collection(
      this.#db,
      ...assignedRoutinesCollectionPath(userId)
    );
    const activeQuery = query(
      collectionRef,
      where('status', '==', 'active'),
      orderBy('assignedAt', 'desc'),
      limit(1)
    );

    return from(getDocs(activeQuery)).pipe(
      map((snapshot) => snapshot.docs[0]),
      switchMap((snapshotDoc) => {
        if (!snapshotDoc) {
          return of(null);
        }

        return this.#hydrateAssignedRoutine(userId, {
          id: snapshotDoc.id,
          ...(snapshotDoc.data() as AssignedRoutineDocument),
        });
      })
    );
  }

  getAssignedRoutineById(
    userId: string,
    assignmentId: string
  ): Observable<AssignedRoutine | null> {
    const ref = doc(
      this.#db,
      ...assignedRoutinesCollectionPath(userId),
      assignmentId
    );

    return from(getDoc(ref)).pipe(
      switchMap((snapshot) => {
        if (!snapshot.exists()) {
          return of(null);
        }

        return this.#hydrateAssignedRoutine(userId, {
          id: snapshot.id,
          ...(snapshot.data() as AssignedRoutineDocument),
        });
      })
    );
  }

  #hydrateAssignedRoutine(
    userId: string,
    assignment: AssignedRoutineDocument & { id: string }
  ): Observable<AssignedRoutine> {
    return from(this.#loadAssignedRoutineDays(userId, assignment.id)).pipe(
      map((days) => ({
        ...assignment,
        days,
      }))
    );
  }

  async #loadAssignedRoutineDays(
    userId: string,
    assignmentId: string
  ): Promise<AssignedRoutineDay[]> {
    const daysSnapshot = await getDocs(
      collection(this.#db, ...assignedRoutineDaysCollectionPath(userId, assignmentId))
    );

    const days = await Promise.all(
      daysSnapshot.docs.map(async (dayDoc) => {
        const exercisesSnapshot = await getDocs(
          collection(
            this.#db,
            ...assignedRoutineExercisesCollectionPath(
              userId,
              assignmentId,
              dayDoc.id
            )
          )
        );

        const exercises = exercisesSnapshot.docs
          .map((exerciseDoc) => ({
            id: exerciseDoc.id,
            ...(exerciseDoc.data() as AssignedRoutineExerciseDocument),
          }))
          .sort((left, right) => left.order - right.order);

        return {
          id: dayDoc.id,
          ...(dayDoc.data() as AssignedRoutineDayDocument),
          exercises,
        } satisfies AssignedRoutineDay;
      })
    );

    return days.sort((left, right) => left.order - right.order);
  }
}
