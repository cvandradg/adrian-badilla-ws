import { inject } from '@angular/core';
import { exhaustMap, pipe, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { FirebaseAuthService } from '@adrian-badilla/ui/shared';
import { withCustomCallState } from './with-custom-call-state.feature';
import { withProps, withMethods, signalStoreFeature } from '@ngrx/signals';

export function withPassResetResources({ store }: { store: any }) {
  return signalStoreFeature(
    withCustomCallState('passReset'),

    withMethods((innerStore) => ({
      passReset: rxMethod<string>(
        pipe(
          tap(() => innerStore.passResetSetLoading()),
          exhaustMap((email) =>
            store._firebaseAuthService.recoverPassword(email).pipe(
              tapResponse({
                next: () => store.passResetSetSuccess(),
                error: (err: Error) => store.passResetSetError(err.message),
              })
            )
          )
        )
      ),
    }))
  );
}
