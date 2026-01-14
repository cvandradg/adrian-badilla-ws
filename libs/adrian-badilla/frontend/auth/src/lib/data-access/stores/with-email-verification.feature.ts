import {
  withProps,
  withMethods,
  signalStoreFeature,
  WritableStateSource,
  withHooks,
} from '@ngrx/signals';
import { User } from 'firebase/auth';
import { inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { toSignal } from '@angular/core/rxjs-interop';
import { FirebaseAuthOut } from '../utils/firebase-auth';
import { ActivatedRoute, Router } from '@angular/router';
import { map, pipe, exhaustMap, distinctUntilChanged } from 'rxjs';
import { withCustomCallState } from './with-custom-call-state.feature';

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
          exhaustMap(() => {
            console.log('📨 intentando enviar correo');

            return store._getUserSession$().pipe(
              exhaustMap((user) =>
                store._sendEmailVerification(user as User).pipe(
                  tapResponse({
                    next: () => {
                      console.log('✅ correo enviado');
                    },
                    error: (err: Error) => {
                      console.error('❌ error enviando correo', err);
                    },
                  })
                )
              )
            );
          })
        )
      ),

      verifyEmailFromRoute: rxMethod<void>(
        pipe(
          exhaustMap(() => {
            innerStore.emailVerificationSetLoading();
            console.log(
              '📩 oobCode leído desde la URL:',
              innerStore._oobCode()
            );

            return store._verifyEmail(innerStore._oobCode() ?? '').pipe(
              tapResponse({
                next: () => {
                  console.log('✅ Firebase confirmó la verificación de correo');
                  innerStore.emailVerificationSetSuccess();

                  innerStore._router.navigate(['/dashboard']);
                },
                error: (err: Error) => {
                  console.error(
                    '❌ Error al verificar el correo en Firebase:',
                    err
                  );
                  innerStore.emailVerificationSetError(
                    err?.message || 'Error desconocido al verificar el correo.'
                  );
                },
              })
            );
          })
        )
      ),
    })),

        withHooks((s) => ({
      onInit() {
        s.verifyEmailFromRoute();
      },
    }))

  );
}
