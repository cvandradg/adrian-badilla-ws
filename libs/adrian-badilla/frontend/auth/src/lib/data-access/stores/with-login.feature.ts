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
import { withLoginInitialState } from '../types/with-login';

export function withLoginResources() {
  return signalStoreFeature(
    withState<withLoginInitialState>({
      isLoginIn: false,
      loginError: null,
    }),
    withProps(() => ({
      firebaseAuthService: inject(FirebaseAuthService),
    })),
    withMethods((innerStore) => ({
      googleSignIn: rxMethod<void>(
        pipe(
          tap(() => patchState(innerStore, { isLoginIn: true })),
          exhaustMap(() => innerStore.firebaseAuthService.googleSignin()),
          tap(() => patchState(innerStore, { isLoginIn: false }))
        )
      ),

      login: rxMethod<Credentials>(
        pipe(
          exhaustMap((creds) => innerStore.firebaseAuthService.login(creds)),
          tap((resp) => console.log('Login Firebase:', resp))
        )
      ),
    }))
  );
}
