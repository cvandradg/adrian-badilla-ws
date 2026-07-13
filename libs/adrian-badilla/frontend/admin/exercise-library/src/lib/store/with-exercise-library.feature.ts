import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import type {
  Exercise,
  ExerciseCreatePayload,
  ExerciseUpdatePayload,
} from '../models/exercise.model';
import { ExerciseRepository } from '../repositories/exercise.repository';
import {
  EXERCISE_CATEGORY_CATALOG,
  EXERCISE_TAG_CATALOG,
  EXERCISE_TYPE_CATALOG,
  LEVEL_CATALOG,
  MUSCLE_CATALOG,
  MOVEMENT_PATTERN_CATALOG,
  MOVEMENT_PLANE_CATALOG,
  labelById,
  labelsById,
} from '../shared/catalogs';

// ─── State ───────────────────────────────────────────────────────────────────

export interface ExerciseLibraryState {
  exercises: Exercise[];
  selectedExercise: Exercise | null;
  loading: boolean;
  saving: boolean;
  search: string;
  error: string | null;
  saveResult: boolean | null;
}

// ─── Filter helper ────────────────────────────────────────────────────────────

function matchesSearch(exercise: Exercise, term: string): boolean {
  // Search against name and tags (plain text)
  if (exercise.name.toLowerCase().includes(term)) return true;
  if (exercise.tags.some((t) => t.toLowerCase().includes(term))) return true;

  // Search against catalog labels (Spanish) and IDs
  const technicalDifficultyLabel = labelById(
    LEVEL_CATALOG,
    exercise.technicalDifficulty
  ).toLowerCase();
  if (
    technicalDifficultyLabel.includes(term) ||
    exercise.technicalDifficulty.includes(term)
  )
    return true;

  const muscleLabel = labelsById(
    MUSCLE_CATALOG,
    exercise.primaryMuscles
  ).toLowerCase();
  if (muscleLabel.includes(term)) return true;
  if (exercise.primaryMuscles.some((m) => m.includes(term))) return true;

  const catLabel = labelById(
    EXERCISE_CATEGORY_CATALOG,
    exercise.exerciseCategory
  ).toLowerCase();
  if (catLabel.includes(term) || exercise.exerciseCategory.includes(term))
    return true;

  const typeLabel = labelById(
    EXERCISE_TYPE_CATALOG,
    exercise.exerciseType
  ).toLowerCase();
  if (typeLabel.includes(term) || exercise.exerciseType.includes(term))
    return true;

  const movementPatternLabel = labelById(
    MOVEMENT_PATTERN_CATALOG,
    exercise.movementPattern
  ).toLowerCase();
  if (
    movementPatternLabel.includes(term) ||
    exercise.movementPattern.includes(term)
  )
    return true;

  const movementPlaneLabel = labelById(
    MOVEMENT_PLANE_CATALOG,
    exercise.movementPlane
  ).toLowerCase();
  if (
    movementPlaneLabel.includes(term) ||
    exercise.movementPlane.includes(term)
  ) {
    return true;
  }

  const tagLabel = labelsById(
    EXERCISE_TAG_CATALOG,
    exercise.tags
  ).toLowerCase();
  if (tagLabel.includes(term)) return true;

  return false;
}

function serializeError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'Error desconocido';
}

// ─── Feature ─────────────────────────────────────────────────────────────────

export function withExerciseLibrary() {
  return signalStoreFeature(
    withState<ExerciseLibraryState>({
      exercises: [],
      selectedExercise: null,
      loading: false,
      saving: false,
      search: '',
      error: null,
      saveResult: null,
    }),

    withComputed((store) => ({
      filteredExercises: computed(() => {
        const term = store.search().toLowerCase().trim();
        if (!term) return store.exercises();
        return store.exercises().filter((e) => matchesSearch(e, term));
      }),

      totalCount: computed(() => store.exercises().length),

      filteredCount: computed(() => {
        const term = store.search().toLowerCase().trim();
        if (!term) return store.exercises().length;
        return store.exercises().filter((e) => matchesSearch(e, term)).length;
      }),
    })),

    withMethods((store) => {
      const repo = inject(ExerciseRepository);

      return {
        /**
         * Starts the live Firestore stream. Each call via switchMap replaces
         * the previous subscription.
         */
        refresh: rxMethod<void>(
          pipe(
            tap(() => patchState(store, { loading: true, error: null })),
            switchMap(() =>
              repo.getAll().pipe(
                tapResponse({
                  next: (exercises) =>
                    patchState(store, { exercises, loading: false }),
                  error: (err: unknown) =>
                    patchState(store, {
                      loading: false,
                      error: serializeError(err),
                    }),
                })
              )
            )
          )
        ),

        /** Updates the search string used by `filteredExercises`. */
        searchExercises(search: string): void {
          patchState(store, { search });
        },

        /** Sets the exercise being edited. Pass null to deselect. */
        selectExercise(exercise: Exercise | null): void {
          patchState(store, { selectedExercise: exercise });
        },

        /** Resets the saveResult signal to idle. */
        clearSaveResult(): void {
          patchState(store, { saveResult: null });
        },

        /** Creates a new exercise document in Firestore. */
        createExercise: rxMethod<ExerciseCreatePayload>(
          pipe(
            tap(() =>
              patchState(store, { saving: true, error: null, saveResult: null })
            ),
            switchMap((data) =>
              repo.create(data).pipe(
                tapResponse({
                  next: () =>
                    patchState(store, { saving: false, saveResult: true }),
                  error: (err: unknown) =>
                    patchState(store, {
                      saving: false,
                      error: serializeError(err),
                      saveResult: false,
                    }),
                })
              )
            )
          )
        ),

        /** Updates an existing exercise document. */
        updateExercise: rxMethod<{ id: string; data: ExerciseUpdatePayload }>(
          pipe(
            tap(() =>
              patchState(store, { saving: true, error: null, saveResult: null })
            ),
            switchMap(({ id, data }) =>
              repo.update(id, data).pipe(
                tapResponse({
                  next: () =>
                    patchState(store, { saving: false, saveResult: true }),
                  error: (err: unknown) =>
                    patchState(store, {
                      saving: false,
                      error: serializeError(err),
                      saveResult: false,
                    }),
                })
              )
            )
          )
        ),

        /** Deletes an exercise document. */
        deleteExercise: rxMethod<string>(
          pipe(
            switchMap((id) =>
              repo.delete(id).pipe(
                tapResponse({
                  // eslint-disable-next-line @typescript-eslint/no-empty-function
                  next: () => {},
                  error: (err: unknown) =>
                    patchState(store, { error: serializeError(err) }),
                })
              )
            )
          )
        ),

        /** Duplicates an exercise by creating a copy with "(Copy)" suffix. */
        duplicateExercise: rxMethod<Exercise>(
          pipe(
            tap(() => patchState(store, { saving: true, error: null })),
            switchMap((exercise) => {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const {
                id: _id,
                createdAt: _c,
                updatedAt: _u,
                ...rest
              } = exercise;
              const payload: ExerciseCreatePayload = {
                ...rest,
                name: `${rest.name} (Copy)`,
              };
              return repo.create(payload).pipe(
                tapResponse({
                  next: () => patchState(store, { saving: false }),
                  error: (err: unknown) =>
                    patchState(store, {
                      saving: false,
                      error: serializeError(err),
                    }),
                })
              );
            })
          )
        ),
      };
    })
  );
}
