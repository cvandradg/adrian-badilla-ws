import {
  signalStoreFeature,
  withMethods,
  withState,
  patchState,
} from '@ngrx/signals';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { exhaustMap, pipe, tap, throwError } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Credentials } from '@adrian-badilla/ui/shared';
import { FirebaseAuthOut } from '../utils/firebase-auth';
import { withCustomCallState } from './with-custom-call-state.feature';
import { mapFirebaseAuthErrorToMessage } from '../errors';
import { User } from 'firebase/auth';

type LoginDeps = FirebaseAuthOut['state'] &
  Pick<
    FirebaseAuthOut['methods'],
    '_googleSignin' | '_login' | '_sendEmailVerification'
  > &
  Pick<FirebaseAuthOut['props'], '_auth'>;

type LoginUiState = { loginNeedsVerification: boolean };

export function withLoginResources<T extends LoginDeps>(store: T) {
  const router = inject(Router);

  return signalStoreFeature(
    withCustomCallState('login'),
    withCustomCallState('resendVerification'),
    withState<LoginUiState>({ loginNeedsVerification: false }),

    withMethods((innerStore) => ({
      googleSignIn: rxMethod<void>(
        pipe(
          tap(() => {
            innerStore.loginSetLoading();
            patchState(innerStore, { loginNeedsVerification: false });
          }),
          exhaustMap(() => store._googleSignin()),
          tapResponse({
            next: (cred) => {
              if (!cred.user.emailVerified) {
                innerStore.loginSetError(null);
                patchState(innerStore, { loginNeedsVerification: true });
                return;
              }
              innerStore.loginSetSuccess();
              router.navigateByUrl('/dashboard', { replaceUrl: true });
            },
            error: (err: unknown) =>
              innerStore.loginSetError(mapFirebaseAuthErrorToMessage(err)),
          })
        )
      ),

      login: rxMethod<Credentials>(
        pipe(
          tap(() => {
            innerStore.loginSetLoading();
            patchState(innerStore, { loginNeedsVerification: false });
          }),
          exhaustMap((creds) =>
            store._login(creds).pipe(
              tapResponse({
                next: (cred) => {
                  if (!cred.user.emailVerified) {
                    innerStore.loginSetError(null);
                    patchState(innerStore, { loginNeedsVerification: true });
                    return;
                  }
                  innerStore.loginSetSuccess();
                  router.navigateByUrl('/dashboard', { replaceUrl: true });
                },
                error: (err: unknown) =>
                  innerStore.loginSetError(mapFirebaseAuthErrorToMessage(err)),
              })
            )
          )
        )
      ),

      resendVerificationEmail: rxMethod<void>(
        pipe(
          tap(() => innerStore.resendVerificationSetLoading()),
          exhaustMap(() => {
            const currentUser = store._auth.currentUser as User | null;

            if (!currentUser) {
              return throwError(() => ({ code: 'auth/user-not-found' }));
            }

            return store._sendEmailVerification(currentUser);
          }),
          tapResponse({
            next: () => innerStore.resendVerificationSetSuccess(),
            error: (err: unknown) =>
              innerStore.resendVerificationSetError(
                mapFirebaseAuthErrorToMessage(err)
              ),
          })
        )
      ),

      resetLoginUi: () => {
        innerStore.loginResetState();
        innerStore.resendVerificationResetState();
        patchState(innerStore, { loginNeedsVerification: false });
      },
    }))
  );
}
