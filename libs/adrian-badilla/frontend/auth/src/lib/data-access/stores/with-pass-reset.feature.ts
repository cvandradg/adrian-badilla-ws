import { withProps, withMethods, signalStoreFeature } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { exhaustMap, pipe, tap } from 'rxjs';
import { inject } from '@angular/core';
import { FirebaseAuthService } from '@adrian-badilla/ui/shared';
import { withCustomCallState } from './with-custom-call-state.feature';
import { tapResponse } from '@ngrx/operators';

export function withPassResetResources() {
  return signalStoreFeature(
    withCustomCallState('passReset'),

    withProps(() => ({
      firebaseAuthService: inject(FirebaseAuthService),
    })),

    withMethods((store) => ({
      passReset: rxMethod<string>(
        pipe(
          tap(() => store.passResetSetLoading()),
          exhaustMap((email) =>
            store.firebaseAuthService.recoverPassword(email).pipe(
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
