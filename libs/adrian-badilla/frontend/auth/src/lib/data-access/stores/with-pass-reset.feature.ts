import { exhaustMap, pipe, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { withCustomCallState } from './with-custom-call-state.feature';
import { withMethods, signalStoreFeature } from '@ngrx/signals';
import { FirebaseAuthService } from '@adrian-badilla/ui/shared';

export function withPassResetResources({
  store,
}: {
  store: { _firebaseAuthService: FirebaseAuthService };
}) {
  return signalStoreFeature(
    withCustomCallState('passReset'),

    withMethods((innerStore) => ({
      passReset: rxMethod<string>(
        pipe(
          tap(() => innerStore.passResetSetLoading()),
          exhaustMap((email) =>
            store._firebaseAuthService.recoverPassword(email).pipe(
              tapResponse({
                next: () => innerStore.passResetSetSuccess(),
                error: (err: Error) =>
                  innerStore.passResetSetError(err.message),
              })
            )
          )
        )
      ),
    }))
  );
}
