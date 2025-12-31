import { exhaustMap, pipe, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { withCustomCallState } from './with-custom-call-state.feature';
import { withMethods, signalStoreFeature } from '@ngrx/signals';
import { Credentials, FirebaseAuthService } from '@adrian-badilla/ui/shared';

export function withRegisterResources({
  store,
}: {
  store: { _firebaseAuthService: FirebaseAuthService };
}) {
  return signalStoreFeature(
    withCustomCallState('register'),

    withMethods((innerStore) => ({
      createAccount: rxMethod<Credentials>(
        pipe(
          tap(() => innerStore.registerSetLoading()),
          exhaustMap((creds) =>
            store._firebaseAuthService.createAccount(creds).pipe(
              tapResponse({
                next: () => innerStore.registerSetSuccess(),
                error: (err: Error) => innerStore.registerSetError(err.message),
              })
            )
          )
        )
      ),
    }))
  );
}
