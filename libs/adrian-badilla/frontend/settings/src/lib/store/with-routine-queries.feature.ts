/**
 * 🏋️ WITH ROUTINE QUERIES FEATURE
 *
 * Loads exercises for the active routine from Firestore and exposes
 * them as signals consumed by RoutinesPageComponent.
 *
 * Architecture mirrors `with-diet-queries.feature` exactly:
 *  - Promise-based async/await (no RxJS subscriptions for data fetching)
 *  - Auth signal via `toSignal` to track the logged-in user
 *  - `patchState` only — no direct state mutations
 *  - All computed selectors live here; components stay dumb
 *
 * Firestore path:
 *   users/{uid}/routines/{routineId}/exercices/{exerciseId}
 *
 * MUST be composed AFTER withRoutes in the signalStore.
 */

import { inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  patchState,
  signalStoreFeature,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  Firestore,
  collection,
  getDocs,
  limit,
  query,
} from '@angular/fire/firestore';
import { Auth, user } from '@angular/fire/auth';
import { userPaths } from '@adrian-badilla/ui/shared';
import type { FirestoreExercise } from '../types/firestore-routine.types';
import type { ExerciseMock } from '../mock/exercises.mock';
import type { Routine, RoutineDay } from '../adapters/decision-item.adapters';
import type { MealStatus } from '../types/diet-decision.types';
import type { DayBase } from '@adrian-badilla/ui/shared';
import {
  buildExerciseLookup,
  groupExercisesByDay,
} from '../adapters/firestore-exercise.adapter';

// ─── State ────────────────────────────────────────────────────────────────────

interface RoutineQueriesState {
  routineDays: RoutineDay[];
  exerciseLookup: Record<string, ExerciseMock>;
  loadingRoutine: boolean;
  errorRoutine: string | null;
  selectedRoutineDayId: string | null;
  _lastLoadedRoutineId: string | null;
  /** True once loadActiveRoutine() has finished, even if no routine was found. */
  routineFetchDone: boolean;
  /** True when loadActiveRoutine() found no routine document for this user. */
  noActiveRoutine: boolean;
}

// ─── Pure helpers (extracted to keep computed/methods ≤ 4 nesting levels) ───────

function isDayComplete(day: RoutineDay): boolean {
  return (
    day.routines.length > 0 &&
    day.routines.every((r) => r.status === 'completed')
  );
}

function getRoutinesForDay(
  routineDays: RoutineDay[],
  dayId: string | null
): Routine[] {
  if (!dayId) return [];
  return routineDays.find((d) => d.id === dayId)?.routines ?? [];
}

function updateRoutineStatus(
  routineDays: RoutineDay[],
  event: { id: string; status: MealStatus }
): RoutineDay[] {
  return routineDays.map((day) => ({
    ...day,
    routines: day.routines.map((r) =>
      r.id === event.id ? { ...r, status: event.status } : r
    ),
  }));
}

// ─── Feature ─────────────────────────────────────────────────────────────────

export function withRoutineQueries() {
  // ✅ Inject at feature function level (valid injection context)
  const firestore = inject(Firestore);
  const auth = inject(Auth);

  return signalStoreFeature(
    withState<RoutineQueriesState>({
      routineDays: [],
      exerciseLookup: {},
      loadingRoutine: false,
      errorRoutine: null,
      selectedRoutineDayId: null,
      _lastLoadedRoutineId: null,
      routineFetchDone: false,
      noActiveRoutine: false,
    }),

    withComputed((store) => {
      const userSignal = toSignal(user(auth), { initialValue: null });

      return {
        /** Authenticated userId — null when not logged in. */
        _routineUserId: computed(() => userSignal()?.uid ?? null),

        /** DayBase[] for the day sidebar (id + label only). */
        routineDayBases: computed((): DayBase[] =>
          store
            .routineDays()
            .map(({ id, label, date }) => ({ id, label, date }))
        ),

        /** Routines to display in the timeline for the currently selected day. */
        selectedDayRoutines: computed(() =>
          getRoutinesForDay(store.routineDays(), store.selectedRoutineDayId())
        ),

        /** True when every routine in the selected day is completed. */
        isSelectedDayComplete: computed(() => {
          const dayId = store.selectedRoutineDayId();
          const day = store.routineDays().find((d) => d.id === dayId);
          if (!day) return false;
          return isDayComplete(day);
        }),

        /** Set of day IDs where ALL routines are completed — used for sidebar checkmarks. */
        completedRoutineDayIds: computed(
          (): Set<string> =>
            new Set(
              store
                .routineDays()
                .filter(isDayComplete)
                .map((d) => d.id)
            )
        ),

        /** True when data is loaded and the selected day has no exercises (e.g. Domingo). */
        isSelectedDayRestDay: computed(() => {
          const routineDays = store.routineDays();
          if (routineDays.length === 0) return false; // data not loaded yet
          const dayId = store.selectedRoutineDayId();
          if (!dayId) return false;
          const day = routineDays.find((d) => d.id === dayId);
          return !day || day.routines.length === 0;
        }),
      };
    }),

    // ─── Primary data-fetch method ──────────────────────────────────────────
    withMethods((store) => ({
      async loadRoutineExercises(routineId: string): Promise<void> {
        const userId = store['_routineUserId']();

        if (!userId) {
          patchState(store, {
            loadingRoutine: false,
            errorRoutine: 'Usuario no autenticado.',
          });
          return;
        }

        // Cache hit — skip re-fetch
        if (
          store['_lastLoadedRoutineId']() === routineId &&
          store.routineDays().length > 0
        ) {
          return;
        }

        patchState(store, { loadingRoutine: true, errorRoutine: null });

        try {
          // Fetch all exercises — no compound orderBy needed (avoids Firestore composite index).
          // Sorting is handled in groupExercisesByDay() via dayOrder + order fields.
          const snap = await getDocs(
            collection(firestore, userPaths.exercises(userId, routineId))
          );

          const allExercises: FirestoreExercise[] = snap.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<FirestoreExercise, 'id'>),
          }));

          const routineDays = groupExercisesByDay(allExercises);
          const exerciseLookup = buildExerciseLookup(allExercises);
          const firstDayId = routineDays[0]?.id ?? null;

          patchState(store, {
            routineDays,
            exerciseLookup,
            loadingRoutine: false,
            routineFetchDone: true,
            _lastLoadedRoutineId: routineId,
            selectedRoutineDayId: firstDayId,
          });
        } catch (error) {
          patchState(store, {
            loadingRoutine: false,
            routineFetchDone: true,
            errorRoutine:
              error instanceof Error
                ? error.message
                : 'Error al cargar los ejercicios.',
          });
        }
      },
    })),

    // ─── Auto-discover the first available routine ──────────────────────────
    withMethods((store) => ({
      async loadActiveRoutine(): Promise<void> {
        const userId = store['_routineUserId']();
        if (!userId) return;

        // Already loaded — skip
        if (store['_lastLoadedRoutineId']()) return;

        try {
          const snap = await getDocs(
            query(collection(firestore, userPaths.routines(userId)), limit(1))
          );

          const firstRoutine = snap.docs[0];
          if (firstRoutine) {
            await store.loadRoutineExercises(firstRoutine.id);
          } else {
            patchState(store, {
              noActiveRoutine: true,
              routineFetchDone: true,
            });
          }
        } catch {
          patchState(store, { routineFetchDone: true, noActiveRoutine: true });
          /* error shown as empty state */
        }
      },

      /** Called when the user taps a day in the sidebar. */
      selectRoutineDay(dayId: string): void {
        patchState(store, { selectedRoutineDayId: dayId });
      },

      /** Called when the user marks an exercise as completed / skipped / pending. */
      updateRoutineExerciseStatus(event: {
        id: string;
        status: MealStatus;
      }): void {
        patchState(store, {
          routineDays: updateRoutineStatus(store.routineDays(), event),
        });
      },
    }))
  );
}
