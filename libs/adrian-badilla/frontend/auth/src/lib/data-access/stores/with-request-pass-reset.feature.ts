import {
  withProps,
  withState,
  patchState,
  withMethods,
  signalStoreFeature,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { tap, of, exhaustMap, pipe } from 'rxjs';

export function withRequestPassResetResources() {
  return signalStoreFeature(
    withState({
      loading: false,
      reseted: false,
      error: null as string | null,
      oobCode: '',
    }),

    withProps(() => ({
      route: inject(ActivatedRoute),
    })),

    withMethods((store) => ({
      initOobCode: rxMethod<void>(
        tap(() => {
          const code = store.route.snapshot.queryParamMap.get('oobCode') || '';
          console.log('🔵 oobCode recibido desde la URL:', code);
          patchState(store, { oobCode: code });
        })
      ),

      resetPassword: rxMethod<{ oobCode: string; newPassword: string }>(
        pipe(
          tap(({ oobCode, newPassword }) => {
            console.log('🟡 resetPassword() llamado con:', {
              oobCode,
              newPassword,
            });

            patchState(store, {
              loading: true,
              reseted: false,
              error: null,
            });
            console.log('loading = true');
          }),

          exhaustMap(() =>
            of('OK').pipe(
              tap(() => {
                console.log('🟢 Simulación exitosa');
                patchState(store, {
                  loading: false,
                  reseted: true,
                });

                console.log('loading = false');
                console.log('reseted = true');
              })
            )
          )
        )
      ),
    }))
  );
}
