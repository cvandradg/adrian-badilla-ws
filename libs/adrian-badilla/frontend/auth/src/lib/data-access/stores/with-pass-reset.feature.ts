import {
  withMethods,
  signalStoreFeature,
  WritableStateSource,
} from '@ngrx/signals';
import { exhaustMap, pipe, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { FirebaseAuthOut } from '../utils/firebase-auth';
import { withCustomCallState } from './with-custom-call-state.feature';
import { mapFirebaseAuthErrorToMessage } from '../errors';

type PassResetDeps = WritableStateSource<FirebaseAuthOut['state']> &
  Pick<FirebaseAuthOut['methods'], '_recoverPassword'>;

export function withPassResetResources<T extends PassResetDeps>(store: T) {
  return signalStoreFeature(
    withCustomCallState('passReset'),

    withMethods((innerStore) => ({
      passReset: rxMethod<string>(
        pipe(
          tap(() => innerStore.passResetSetLoading()),
          exhaustMap((email) =>
            store._recoverPassword(email).pipe(
              tapResponse({
                next: () => innerStore.passResetSetSuccess(),
                error: (err: unknown) =>
                  innerStore.passResetSetError(
                    mapFirebaseAuthErrorToMessage(err)
                  ),
              })
            )
          )
        )
      ),
    }))
  );
}
