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
  RoutineTemplate,
  RoutineCreatePayload,
  RoutineUpdatePayload,
} from '../models/routine.model';
import { RoutineRepository } from '../repositories/routine.repository';

// ─── State ───────────────────────────────────────────────────────────────────

export interface RoutineBuilderState {
  routines: RoutineTemplate[];
  selectedRoutine: RoutineTemplate | null;
  loading: boolean;
  saving: boolean;
  search: string;
  error: string | null;
  saveResult: boolean | null;
  createdRoutineId: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function matchesRoutineSearch(routine: RoutineTemplate, term: string): boolean {
  if (routine.name.toLowerCase().includes(term)) return true;
  if (routine.description.toLowerCase().includes(term)) return true;
  if (routine.tags.some((t) => t.toLowerCase().includes(term))) return true;
  if (routine.difficulty.includes(term)) return true;
  return false;
}

function serializeError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'Error desconocido';
}

// ─── Feature ─────────────────────────────────────────────────────────────────

export function withRoutineBuilder() {
  return signalStoreFeature(
    withState<RoutineBuilderState>({
      routines: [],
      selectedRoutine: null,
      loading: false,
      saving: false,
      search: '',
      error: null,
      saveResult: null,
      createdRoutineId: null,
    }),

    withComputed((store) => ({
      filteredRoutines: computed(() => {
        const term = store.search().toLowerCase().trim();
        if (!term) return store.routines();
        return store.routines().filter((r) => matchesRoutineSearch(r, term));
      }),
      totalCount: computed(() => store.routines().length),
    })),

    withMethods((store) => {
      const repo = inject(RoutineRepository);

      return {
        refresh: rxMethod<void>(
          pipe(
            tap(() => patchState(store, { loading: true, error: null })),
            switchMap(() =>
              repo.getAll().pipe(
                tapResponse({
                  next: (routines) =>
                    patchState(store, { routines, loading: false }),
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

        searchRoutines(search: string): void {
          patchState(store, { search });
        },

        selectRoutine(routine: RoutineTemplate | null): void {
          patchState(store, { selectedRoutine: routine });
        },

        clearSaveResult(): void {
          patchState(store, { saveResult: null, createdRoutineId: null });
        },

        createRoutine: rxMethod<RoutineCreatePayload>(
          pipe(
            tap(() =>
              patchState(store, {
                saving: true,
                error: null,
                saveResult: null,
                createdRoutineId: null,
              })
            ),
            switchMap((data) =>
              repo.create(data).pipe(
                tapResponse({
                  next: (id) =>
                    patchState(store, {
                      saving: false,
                      saveResult: true,
                      createdRoutineId: id,
                      // optimistically track the new ID for navigation
                      selectedRoutine: { id } as RoutineTemplate,
                    }),
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

        updateRoutine: rxMethod<{ id: string; data: RoutineUpdatePayload }>(
          pipe(
            tap(() =>
              patchState(store, {
                saving: true,
                error: null,
                saveResult: null,
                createdRoutineId: null,
              })
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

        deleteRoutine: rxMethod<string>(
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

        duplicateRoutine: rxMethod<RoutineTemplate>(
          pipe(
            tap(() => patchState(store, { saving: true, error: null })),
            switchMap((routine) => {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = routine;
              const reassignedDays = rest.days.map((day) => {
                const newExercises = day.exercises.map((ex) => ({
                  ...ex,
                  exId: crypto.randomUUID(),
                }));
                return { ...day, dayId: crypto.randomUUID(), exercises: newExercises };
              });
              const payload: RoutineCreatePayload = {
                ...rest,
                name: `${rest.name} (Copia)`,
                days: reassignedDays,
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
