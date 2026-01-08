import { exhaustMap, pipe, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { withCustomCallState } from './with-custom-call-state.feature';
import {
  withMethods,
  signalStoreFeature,
  WritableStateSource,
} from '@ngrx/signals';
import { Credentials } from '@adrian-badilla/ui/shared';
import { FirebaseAuthOut } from '../utils/firebase-auth';

type RegisterDeps = WritableStateSource<FirebaseAuthOut['state']> &
  Pick<FirebaseAuthOut['methods'], '_createAccount'>;

export function withRegisterResources<T extends RegisterDeps>(store: T) {
  return signalStoreFeature(
    withCustomCallState('register'),

    withMethods((innerStore) => ({
      createAccount: rxMethod<Credentials>(
        pipe(
          tap(() => innerStore.registerSetLoading()),
          exhaustMap((creds) =>
            store._createAccount(creds).pipe(
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
