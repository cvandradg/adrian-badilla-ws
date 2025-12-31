import { exhaustMap, pipe, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { withCustomCallState } from './with-custom-call-state.feature';
import { withMethods, signalStoreFeature } from '@ngrx/signals';
import { Credentials, FirebaseAuthService } from '@adrian-badilla/ui/shared';

export function withLoginResources({
  store,
}: {
  store: { _firebaseAuthService: FirebaseAuthService };
}) {
  return signalStoreFeature(
    withCustomCallState('login'),

    withMethods((innerStore) => ({
      googleSignIn: rxMethod<void>(
        pipe(
          tap(() => innerStore.loginSetLoading()),
          exhaustMap(() =>
            store._firebaseAuthService.googleSignin().pipe(
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
            store._firebaseAuthService.login(creds).pipe(
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
