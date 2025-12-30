import { signalStoreFeature, withMethods, withProps } from '@ngrx/signals';
import { withCustomCallState } from './with-custom-call-state.feature';
import { FirebaseAuthService } from '@adrian-badilla/ui/shared';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { from, tap } from 'rxjs';

export function withEmailVerificationResources() {
  return signalStoreFeature(
    withCustomCallState('emailVerification'),
    withProps(() => ({
      firebaseAuthService: inject(FirebaseAuthService),
    })),

    withMethods(() => ({
  testRx: rxMethod<void>(() =>
    from(['hola']).pipe(
      tap(x => console.log('probando log', x))
    )
  ),
    }))
  );
}
