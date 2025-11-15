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

export function withPassResetResources() {
  return signalStoreFeature(
    withState({
      loading: false,
      requested: false,
      error: null as string | null,
    }),

    withProps(() => ({
      firebaseAuthService: inject(FirebaseAuthService),
    })),

    withMethods((store) => ({
      passReset: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          exhaustMap((email) =>
            store.firebaseAuthService.recoverPassword(email).pipe(
              tap(() => {
                console.log('Correo de recuperación enviado');
                patchState(store, {
                  loading: false,
                  requested: true,
                });
              }),
              catchError((err) => {
                console.error('Error al enviar correo:', err);
                patchState(store, {
                  loading: false,
                  error: err.message ?? 'Error desconocido',
                });
                return of(null);
              })
            )
          )
        )
      ),
    }))
  );
}
