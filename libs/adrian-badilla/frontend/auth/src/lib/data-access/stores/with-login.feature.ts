import { exhaustMap, pipe, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { withCustomCallState } from './with-custom-call-state.feature';
import { withMethods, signalStoreFeature } from '@ngrx/signals';
import { Credentials } from '@adrian-badilla/ui/shared';
import type { FirebaseAuthStore } from './auth.store'; // ajusta el path real

export function withLoginResources(store: FirebaseAuthStore) {
  return signalStoreFeature(
    withCustomCallState('login'),

    withMethods((innerStore) => ({
      googleSignIn: rxMethod<void>(
        pipe(
          tap(() => innerStore.loginSetLoading()),
          exhaustMap(() =>
            store.googleSignin().pipe(
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
          exhaustMap((creds) =>
            store.login(creds).pipe(
              tapResponse({
                next: (resp) => {
                  console.log('Login Firebase:', resp);
                  innerStore.loginSetSuccess();
                },
                error: (err: Error) => {
                  innerStore.loginSetError(err.message);
                },
              })
            )
          )
        )
      ),
    }))
  );
}
