import {
  withProps,
  withState,
  patchState,
  withMethods,
  signalStoreFeature,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { exhaustMap, pipe, tap } from 'rxjs';
import { inject } from '@angular/core';
import { Credentials, FirebaseAuthService } from '@adrian-badilla/ui/shared';

export function withRegisterResources() {
  return signalStoreFeature(
    withState({
      isRegistering: false,
      registerError: null,
      registerSuccess: false,
    }),

    withProps(() => ({
      firebaseAuthService: inject(FirebaseAuthService),
    })),

    withMethods((innerStore) => ({
      createAccount: rxMethod<Credentials>(
        pipe(
          tap(() => patchState(innerStore, { isRegistering: true })),
          exhaustMap((creds) =>
            innerStore.firebaseAuthService.createAccount(creds)
          ),
          tap((resp) => {
            console.log('Cuenta creada Firebase:', resp);
            patchState(innerStore, {
              isRegistering: false,
              registerSuccess: true,
            });
          })
        )
      ),
    }))
  );
}
