import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { exhaustMap, Observable, pipe, tap } from 'rxjs';
import { signalStoreFeature, withMethods } from '@ngrx/signals';
import { withCustomCallState } from '../../../../auth/src/lib/data-access/stores/with-custom-call-state.feature';

export type DietsCrudParentDeps = {
  _create: <T extends object>(params: {
    collectionPath: string;
    data: T;
  }) => Observable<unknown>;
  _remove: (params: { collectionPath: string; id: string }) => Observable<void>;
  _update: <T extends object>(params: {
    collectionPath: string;
    id: string;
    data: Partial<T>;
  }) => Observable<void>;
};

export function withDietsCrud<T extends DietsCrudParentDeps>(
  innerStore: any,
  settingsStore: T,
) {
  return signalStoreFeature(
    withCustomCallState('createDiet'),
    withCustomCallState('saveDiet'),
    withCustomCallState('removeDiet'),
    withMethods(() => ({
      createDiet: rxMethod<{
        name: string;
        route: string;
        province: string;
        estimateLocation: string;
        exactLocation: string;
      }>(
        pipe(
          tap(() => innerStore._createDietSetLoading()),
          exhaustMap((draft) =>
            settingsStore._create({
              collectionPath: 'diets',
              data: {
                name: draft.name.trim(),
                route: draft.route.trim(),
                province: draft.province.trim(),
                estimateLocation: draft.estimateLocation.trim(),
                exactLocation: draft.exactLocation.trim(),
              },
            }),
          ),
          tapResponse({
            next: () => innerStore._createDietSetSuccess(),
            error: (err: unknown) => innerStore._createDietSetError(String(err)),
          }),
        ),
      ),

      saveDiet: rxMethod<{
        id: string;
        name: string;
        route: string;
        province: string;
        estimateLocation: string;
        exactLocation: string;
      }>(
        pipe(
          tap(() => innerStore._saveDietSetLoading()),
          exhaustMap((draft) =>
            settingsStore._update<{
              name: string;
              route: string;
              province: string;
              estimateLocation: string;
              exactLocation: string;
            }>({
              collectionPath: 'diets',
              id: draft.id,
              data: {
                name: draft.name.trim(),
                route: draft.route.trim(),
                province: draft.province.trim(),
                estimateLocation: draft.estimateLocation.trim(),
                exactLocation: draft.exactLocation.trim(),
              },
            }),
          ),
          tapResponse({
            next: () => innerStore._saveDietSetSuccess(),
            error: (err: unknown) => innerStore._saveDietSetError(String(err)),
          }),
        ),
      ),

      removeDiet: rxMethod<{
        id: string;
      }>(
        pipe(
          tap(() => innerStore._removeDietSetLoading()),
          exhaustMap(({ id }) =>
            settingsStore._remove({
              collectionPath: 'diets',
              id,
            }),
          ),
          tapResponse({
            next: () => innerStore._removeDietSetSuccess(),
            error: (err: unknown) => innerStore._removeDietSetError(String(err)),
          }),
        ),
      ),
    })),
  );
}
