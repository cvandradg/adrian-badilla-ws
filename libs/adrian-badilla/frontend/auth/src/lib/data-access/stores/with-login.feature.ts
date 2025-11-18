import { inject } from '@angular/core';
import { exhaustMap, pipe, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { withCustomCallState } from './with-custom-call-state.feature';
import { withProps, withMethods, signalStoreFeature } from '@ngrx/signals';
import { Credentials, FirebaseAuthService } from '@adrian-badilla/ui/shared';

export function withLoginResources() {
  return signalStoreFeature(
    withCustomCallState('login'),

    withProps(() => ({
      firebaseAuthService: inject(FirebaseAuthService),
    })),
    withMethods((innerStore) => ({
      googleSignIn: rxMethod<void>(
        pipe(
          tap(() => innerStore.loginSetLoading()),
          exhaustMap(() =>
            innerStore.firebaseAuthService.googleSignin().pipe(
              tapResponse({
                next: () => innerStore.loginSetSuccess(),
                error: (err: Error) => innerStore.loginSetError(err.message),
              })
            )
          )
        )
      ),

      login: rxMethod<Credentials>(
        pipe(
          tap(() => innerStore.loginSetLoading()),
          exhaustMap((creds) => innerStore.firebaseAuthService.login(creds)),
          tap((resp) => {
            console.log('Login Firebase:', resp);
            innerStore.loginSetSuccess();
          })
        )
      ),
    }))
  );
}
