import {
  withProps,
  withState,
  patchState,
  withMethods,
  signalStoreFeature,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { exhaustMap, from, of, pipe, tap } from 'rxjs';
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

    withMethods(() => ({
          testResetPassword() {
      console.log('Método del store funcionando correctamente');
    },

          testRxResetPassword: rxMethod<void>(
        pipe(
          exhaustMap(() =>
            of('hola').pipe(
              tap((x) => console.log('probando log:', x))
            )
          )
        )
      ),

    }))
  );
}
