import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  orderBy,
  query,
  where,
} from '@angular/fire/firestore';
import type { Exercise } from '@admin/exercise-library';
import type { RoutineTemplate } from '@admin/routine-builder';
import { combineLatest, map, Observable, take } from 'rxjs';
import { AIUserContextBuilder } from '../../context/builders/ai-user-context.builder';
import type {
  AIUserContextSource,
  AIUserContextSourceHealthProfile,
} from '../../context/models/ai-user-context.model';
import type { RawAthleteProfile } from '../../context/mappers/athlete-profile-normalizer';
import { RoutineRecommendationContextBuilder } from '../builders/routine-recommendation-context.builder';
import { RoutineRecommendationEngine } from '../engines/routine-recommendation.engine';
import type { RoutineRecommendationResult } from '../models/routine-recommendation-result.model';

interface UserDocumentRecord {
  uid?: string;
  displayName?: string;
  gender?: string | null;
  healthProfile?: AIUserContextSourceHealthProfile | null;
  athleteProfile?: RawAthleteProfile | null;
  ageYears?: number | null;
  heightCm?: number | null;
  weightKg?: number | null;
  bodyFatPercent?: number | null;
}

function isActiveTemplate(template: RoutineTemplate): boolean {
  return template.isActive && template.isTemplate;
}

function isActiveExercise(exercise: Exercise): boolean {
  return exercise.isActive;
}

function extractRequiredExerciseIds(
  routineTemplates: RoutineTemplate[]
): Set<string> {
  return new Set(
    routineTemplates.flatMap((template) =>
      template.days.flatMap((day) =>
        day.exercises.map((slot) => slot.exerciseId)
      )
    )
  );
}

function buildUserContextSource(
  userId: string,
  userRecord: UserDocumentRecord | null | undefined
): AIUserContextSource {
  if (!userRecord) {
    throw new Error(`User profile not found for "${userId}".`);
  }

  return {
    uid: userRecord.uid ?? userId,
    userId,
    displayName: userRecord.displayName ?? '',
    healthProfile: userRecord.healthProfile ?? null,
    athleteProfile: userRecord.athleteProfile ?? null,
    gender: userRecord.gender ?? null,
    ageYears: userRecord.ageYears ?? null,
    heightCm: userRecord.heightCm ?? null,
    weightKg: userRecord.weightKg ?? null,
    bodyFatPercent: userRecord.bodyFatPercent ?? null,
  };
}

@Injectable({ providedIn: 'root' })
export class RoutineRecommendationFacade {
  readonly #db = inject(Firestore);
  readonly #userContextBuilder = new AIUserContextBuilder();
  readonly #recommendationContextBuilder =
    new RoutineRecommendationContextBuilder();
  readonly #recommendationEngine = new RoutineRecommendationEngine();

  getActiveExercises(): Observable<Exercise[]> {
    const activeExercisesQuery = query(
      collection(this.#db, 'exercise-library'),
      where('isActive', '==', true),
      orderBy('name')
    );

    return (
      collectionData(activeExercisesQuery, {
        idField: 'id',
      }) as Observable<Exercise[]>
    ).pipe(
      take(1),
      map((exercises) => exercises.filter(isActiveExercise))
    );
  }

  getRoutineRecommendationsForUser(
    userId: string
  ): Observable<RoutineRecommendationResult[]> {
    const userRef = doc(this.#db, 'users', userId);
    const activeRoutineTemplatesQuery = query(
      collection(this.#db, 'routine-library'),
      where('isActive', '==', true),
      where('isTemplate', '==', true),
      orderBy('name')
    );
    return combineLatest([
      docData(userRef) as Observable<UserDocumentRecord | undefined>,
      collectionData(activeRoutineTemplatesQuery, {
        idField: 'id',
      }) as Observable<RoutineTemplate[]>,
      this.getActiveExercises(),
    ]).pipe(
      take(1),
      map(([userRecord, routineTemplates, exercises]) => {
        const activeRoutineTemplates =
          routineTemplates.filter(isActiveTemplate);
        const requiredExerciseIds = extractRequiredExerciseIds(
          activeRoutineTemplates
        );
        const requiredExercises = exercises.filter(
          (exercise) =>
            isActiveExercise(exercise) && requiredExerciseIds.has(exercise.id)
        );
        const userContext = this.#userContextBuilder.build(
          buildUserContextSource(userId, userRecord)
        );
        const recommendationContext = this.#recommendationContextBuilder.build(
          userContext,
          activeRoutineTemplates,
          requiredExercises
        );

        return this.#recommendationEngine.run(recommendationContext);
      })
    );
  }

  getTopRoutineRecommendationForUser(
    userId: string
  ): Observable<RoutineRecommendationResult | null> {
    return this.getRoutineRecommendationsForUser(userId).pipe(
      map((results) => results[0] ?? null)
    );
  }
}
