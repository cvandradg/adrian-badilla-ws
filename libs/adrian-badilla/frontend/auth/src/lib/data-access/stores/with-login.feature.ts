import {
  withMethods,
  signalStoreFeature,
  WritableStateSource,
} from '@ngrx/signals';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { exhaustMap, pipe, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Credentials } from '@adrian-badilla/ui/shared';
import { FirebaseAuthOut } from '../utils/firebase-auth';
import { withCustomCallState } from './with-custom-call-state.feature';

type LoginDeps = WritableStateSource<FirebaseAuthOut['state']> &
  Pick<FirebaseAuthOut['methods'], '_googleSignin' | '_login'>;

export function withLoginResources<T extends LoginDeps>(store: T) {
  const router = inject(Router);

  return signalStoreFeature(
    withCustomCallState('login'),

    withMethods((innerStore) => ({
      googleSignIn: rxMethod<void>(
        pipe(
          tap(() => innerStore.loginSetLoading()),
          exhaustMap(() => store._googleSignin()),
          tapResponse({
            next: () => {
              innerStore.loginSetSuccess();
              router.navigateByUrl('/dashboard', { replaceUrl: true });
            },
            error: (err: Error) => innerStore.loginSetError(err.message),
          })
        )
      ),

      login: rxMethod<Credentials>(
        pipe(
          tap(() => innerStore.loginSetLoading()),
          exhaustMap((creds) => store._login(creds)),
          tapResponse({
            next: () => {
              innerStore.loginSetSuccess();
              router.navigateByUrl('/dashboard', { replaceUrl: true });
            },
            error: (err: Error) => innerStore.loginSetError(err.message),
          })
        )
      ),
    }))
  );
}
