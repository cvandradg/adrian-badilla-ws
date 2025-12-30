import { signalStoreFeature, withMethods, withProps } from '@ngrx/signals';
import { withCustomCallState } from './with-custom-call-state.feature';
import { FirebaseAuthService } from '@adrian-badilla/ui/shared';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { exhaustMap, pipe,} from 'rxjs';
import { tapResponse } from '@ngrx/operators';

export function withEmailVerificationResources() {
  return signalStoreFeature(
    withCustomCallState('emailVerification'),
    withProps(() => ({
      firebaseAuthService: inject(FirebaseAuthService),
    })),

    withMethods((innerStore) => ({
      verifyEmailFromRouteTest: rxMethod<void>(
        pipe(
          exhaustMap(() =>
            innerStore.firebaseAuthService.verifyEmail('TEST_CODE').pipe(
              tapResponse({
                next: (res) => {
                  console.log('resultado verifyEmail (test):', res);
                },
                error: (err: unknown) => {
                  console.error('ERROR verifyEmail (test):', err);
                },
              })
            )
          )
        )
      ),
    }))
  );
}
