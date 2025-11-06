import {
  withProps,
  withState,
  patchState,
  withMethods,
  signalStoreFeature,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { delay, exhaustMap, pipe, tap } from 'rxjs';
import { inject } from '@angular/core';
import { Credentials, FirebaseAuthService } from '@adrian-badilla/ui/shared';
import { withLoginInitialState } from '../types/with-login';

export function withLoginResources() {
  return signalStoreFeature(
    withState<withLoginInitialState>({
      isLoginIn: false,
      loginError: null,
      loginSuccess: false,
    }),
    withProps(() => ({
      firebaseAuthService: inject(FirebaseAuthService),
    })),
    withMethods((innerStore) => ({
      googleSignIn: rxMethod<void>(
        pipe(
          tap(() =>
            patchState(innerStore, { isLoginIn: true, loginSuccess: false })
          ),
          exhaustMap(() => innerStore.firebaseAuthService.googleSignin()),
          tap(() =>
            patchState(innerStore, { isLoginIn: false, loginSuccess: true })
          )
        )
      ),

login: rxMethod<Credentials>(
  pipe(
    tap(() =>
      patchState(innerStore, {
        isLoginIn: true,
        loginSuccess: false,
      })
    ),
    exhaustMap((creds) =>
      innerStore.firebaseAuthService.login(creds)
    ),
    tap((resp) => {
      console.log('Login Firebase:', resp);
      patchState(innerStore, {
        isLoginIn: false,
        loginSuccess: true,
      });
    })
  )
),

    }))
  );
}
