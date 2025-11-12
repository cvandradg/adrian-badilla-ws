import {
  withProps,
  withState,
  patchState,
  withMethods,
  signalStoreFeature,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, exhaustMap, from, of, pipe, tap } from 'rxjs';
import { inject } from '@angular/core';
import { Credentials, FirebaseAuthService } from '@adrian-badilla/ui/shared';

export function withPassResetResources() {
  return signalStoreFeature(
    withState({
      isRegistering: false,
      registerError: null,
      registerSuccess: false,
    }),

    withProps(() => ({
      firebaseAuthService: inject(FirebaseAuthService),
    })),

    withMethods((store) => ({
          testResetPassword() {
      console.log('Método del store funcionando correctamente');
    },

          testRxResetPassword: rxMethod<void>(
        pipe(
          exhaustMap(() =>
            store.firebaseAuthService
              .recoverPassword('correo@ejemplo.com')
              .pipe(
                tap((resultado) =>
                  console.log('Resultado del recoverPassword:', resultado),
                          catchError((err: { message: any; }) => {
            console.error('❌ Error al enviar el correo:', err.message);
            return of(null);
          })
                )
              )
          )
        )
      ),

    }))
  );
}
