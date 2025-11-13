import {
  withProps,
  withState,
  patchState,
  withMethods,
  signalStoreFeature,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, exhaustMap, of, pipe, tap } from 'rxjs';
import { inject } from '@angular/core';
import { FirebaseAuthService } from '@adrian-badilla/ui/shared';

export function withRequestPassResetResources() {
  return signalStoreFeature(
    withState({
      loading: false,
      reseted: false,
      error: null as string | null,
    }),

    withProps(() => ({
      firebaseAuthService: inject(FirebaseAuthService),
    })),

    withMethods((store) => ({
      resetPassword: rxMethod<{ oobCode: string; newPassword: string }>(
        pipe(
          tap(() => {
            console.log('🟡 resetPassword(): iniciando simulación…');
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
                console.log('🟢 Simulación completada correctamente');
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
