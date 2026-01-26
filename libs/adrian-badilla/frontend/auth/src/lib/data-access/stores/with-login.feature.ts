import {
  signalStoreFeature,
  withMethods,
  withState,
  patchState,
} from '@ngrx/signals';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { exhaustMap, pipe, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Credentials } from '@adrian-badilla/ui/shared';
import { FirebaseAuthOut } from '../utils/firebase-auth';
import { withCustomCallState } from './with-custom-call-state.feature';
import { mapFirebaseAuthErrorToMessage } from '../errors';

type LoginDeps = FirebaseAuthOut['state'] &
  Pick<FirebaseAuthOut['methods'], '_googleSignin' | '_login'>;

type LoginUiState = { loginNeedsVerification: boolean };

export function withLoginResources<T extends LoginDeps>(store: T) {
  const router = inject(Router);

  return signalStoreFeature(
    withCustomCallState('login'),
    withState<LoginUiState>({ loginNeedsVerification: false }),

    withMethods((s) => ({
      googleSignIn: rxMethod<void>(
        pipe(
          tap(() => {
            s.loginSetLoading();
            patchState(s, { loginNeedsVerification: false });
          }),
          exhaustMap(() => store._googleSignin()),
          tapResponse({
            next: (cred) => {
              if (!cred.user.emailVerified) {
                s.loginSetError(null);
                patchState(s, { loginNeedsVerification: true });
                return;
              }
              s.loginSetSuccess();
              router.navigateByUrl('/dashboard', { replaceUrl: true });
            },
            error: (err: unknown) =>
              s.loginSetError(mapFirebaseAuthErrorToMessage(err)),
          })
        )
      ),

      login: rxMethod<Credentials>(
        pipe(
          tap(() => {
            s.loginSetLoading();
            patchState(s, { loginNeedsVerification: false });
          }),
          exhaustMap((creds) => store._login(creds)),
          tapResponse({
            next: (cred) => {
              if (!cred.user.emailVerified) {
                s.loginSetError(null);
                patchState(s, { loginNeedsVerification: true });
                return;
              }
              s.loginSetSuccess();
              router.navigateByUrl('/dashboard', { replaceUrl: true });
            },
            error: (err: unknown) =>
              s.loginSetError(mapFirebaseAuthErrorToMessage(err)),
          })
        )
      ),
    }))
  );
}
