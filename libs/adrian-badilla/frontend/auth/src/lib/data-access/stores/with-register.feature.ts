import {
  signalStoreFeature,
  withMethods,
  WritableStateSource,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { exhaustMap, pipe, tap } from 'rxjs';
import { UserCredential } from 'firebase/auth';

import { Credentials } from '@adrian-badilla/ui/shared';
import { FirebaseAuthOut } from '../utils/firebase-auth';
import { withCustomCallState } from './with-custom-call-state.feature';
import { mapFirebaseAuthErrorToMessage } from '../errors';

type RegisterDeps = WritableStateSource<FirebaseAuthOut['state']> &
  Pick<FirebaseAuthOut['methods'], '_createAccount' | '_sendEmailVerification'>;

export function withRegisterResources<T extends RegisterDeps>(store: T) {
  return signalStoreFeature(
    withCustomCallState('register'),

    withMethods((innerStore) => ({
      createAccount: rxMethod<Credentials>(
        pipe(
          tap(() => innerStore.registerSetLoading()),

          exhaustMap((creds) =>
            store._createAccount(creds).pipe(
              exhaustMap((cred: UserCredential) =>
                store._sendEmailVerification(cred.user)
              ),
              tapResponse({
                next: () => innerStore.registerSetSuccess(),
                error: (err: unknown) =>
                  innerStore.registerSetError(
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
