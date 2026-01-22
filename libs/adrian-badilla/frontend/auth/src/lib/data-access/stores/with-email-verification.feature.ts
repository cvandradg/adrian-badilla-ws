import {
  withProps,
  withMethods,
  signalStoreFeature,
  WritableStateSource,
} from '@ngrx/signals';
import { User } from 'firebase/auth';
import { inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { toSignal } from '@angular/core/rxjs-interop';
import { FirebaseAuthOut } from '../utils/firebase-auth';
import { ActivatedRoute, Router } from '@angular/router';
import { map, pipe, exhaustMap, distinctUntilChanged, filter, tap } from 'rxjs';
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
          exhaustMap(() =>
            store._getUserSession$().pipe(
              filter((user): user is User => !!user),
              exhaustMap((user) =>
                store._sendEmailVerification(user).pipe(
                  tapResponse({
                    next: () => console.log('✅ correo enviado'),
                    error: (err: Error) =>
                      console.error('❌ error enviando correo', err),
                  })
                )
              )
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
                error: (err: Error) => {
                  console.error('❌ Error al verificar el correo:', err);
                  innerStore.emailVerificationSetError(
                    err?.message || 'Error desconocido al verificar el correo.'
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
