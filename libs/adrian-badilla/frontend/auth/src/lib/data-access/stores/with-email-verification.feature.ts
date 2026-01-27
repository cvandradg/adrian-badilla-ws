import {
  withProps,
  withMethods,
  signalStoreFeature,
  WritableStateSource,
} from '@ngrx/signals';
import { inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { toSignal } from '@angular/core/rxjs-interop';
import { FirebaseAuthOut } from '../utils/firebase-auth';
import { ActivatedRoute, Router } from '@angular/router';
import {
  map,
  pipe,
  exhaustMap,
  distinctUntilChanged,
  tap,
  EMPTY,
  switchMap,
  take,
} from 'rxjs';
import { withCustomCallState } from './with-custom-call-state.feature';
import { mapFirebaseAuthErrorToMessage } from '../errors';

type EmailVerificationResetDeps = WritableStateSource<
  FirebaseAuthOut['state']
> &
  Pick<FirebaseAuthOut['methods'], '_sendEmailVerification' | '_verifyEmail'> &
  Pick<FirebaseAuthOut['props'], '_getUserSession$'>;

export function withEmailVerificationResources<
  T extends EmailVerificationResetDeps
>(store: T) {
  return signalStoreFeature(
    withCustomCallState('emailVerification'),

    withProps((_, route = inject(ActivatedRoute)) => ({
      _router: inject(Router),
      _oobCode: toSignal(
        route.queryParamMap.pipe(
          map((params) => params.get('oobCode')),
          distinctUntilChanged()
        )
      ),
    })),

    withMethods((innerStore) => ({
      sendEmailVerification: rxMethod<void>(
        pipe(
          tap(() => innerStore.emailVerificationSetLoading()),
          exhaustMap(() =>
            store._getUserSession$().pipe(
              take(1),
              switchMap((user) => {
                if (!user) {
                  innerStore.emailVerificationSetError('Usuario actual faltante.');
                  return EMPTY;
                }

                return store._sendEmailVerification(user).pipe(
                  tapResponse({
                    next: () => innerStore.emailVerificationSetSuccess(),
                    error: (err: unknown) =>
                      innerStore.emailVerificationSetError(
                        mapFirebaseAuthErrorToMessage(err)
                      ),
                  })
                );
              })
            )
          )
        )
      ),

      verifyEmailFromRoute: rxMethod<void>(
        pipe(
          tap(() => innerStore.emailVerificationSetLoading()),
          exhaustMap(() => {
            const code = innerStore._oobCode();
            console.log('📩 oobCode leído desde la URL:', code);

            return store._verifyEmail(code ?? '').pipe(
              tapResponse({
                next: () => {
                  console.log('✅ Firebase confirmó la verificación de correo');
                  innerStore.emailVerificationSetSuccess();
                },
                error: (err: unknown) => {
                  innerStore.emailVerificationSetError(
                    mapFirebaseAuthErrorToMessage(err)
                  );
                },
              })
            );
          })
        )
      ),

      goToDashboard: rxMethod<void>(
        pipe(exhaustMap(() => innerStore._router.navigate(['/dashboard'])))
      ),
    }))
  );
}
