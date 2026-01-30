import {
  signalStoreFeature,
  withMethods,
  withProps,
  WritableStateSource,
} from '@ngrx/signals';
import { inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import {
  EMPTY,
  exhaustMap,
  pipe,
  switchMap,
  take,
  tap,
  from,
} from 'rxjs';

import { FirebaseAuthOut } from '../utils/firebase-auth';
import { withCustomCallState } from './with-custom-call-state.feature';
import { mapFirebaseAuthErrorToMessage } from '../errors';

type EmailVerificationDeps = WritableStateSource<FirebaseAuthOut['state']> &
  Pick<FirebaseAuthOut['methods'], '_sendEmailVerification' | '_verifyEmail'> &
  Pick<FirebaseAuthOut['props'], '_getUserSession$'>;

export function withEmailVerificationResources<T extends EmailVerificationDeps>(
  store: T
) {
  return signalStoreFeature(
    withCustomCallState('emailVerification'),

    withProps(() => ({
      _router: inject(Router),
      _route: inject(ActivatedRoute),
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
                  innerStore.emailVerificationSetError(
                    'Usuario actual faltante.'
                  );
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
            const oobCode = innerStore._route.snapshot.queryParamMap.get('oobCode');

            if (!oobCode) {
              innerStore.emailVerificationSetError(
                'Falta el código de verificación en el enlace.'
              );
              return EMPTY;
            }

            return store._verifyEmail(oobCode).pipe(
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
      ),

      goToDashboard: rxMethod<void>(
        pipe(exhaustMap(() => from(innerStore._router.navigate(['/dashboard']))))
      ),
    }))
  );
}
