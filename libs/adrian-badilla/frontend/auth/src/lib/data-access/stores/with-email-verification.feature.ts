import { signalStoreFeature, withMethods, withProps } from '@ngrx/signals';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { distinctUntilChanged, exhaustMap, map, pipe } from 'rxjs';
import { inject } from '@angular/core';
import { FirebaseAuthService } from '@adrian-badilla/ui/shared';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { withCustomCallState } from './with-custom-call-state.feature';

export function withEmailVerificationResources({
  store,
}: {
  store: {
    _firebaseAuthService: FirebaseAuthService;
  };
}) {
  return signalStoreFeature(
    withCustomCallState('emailVerification'),

    withProps((_, route = inject(ActivatedRoute)) => ({
      _oobCode: toSignal(
        route.queryParamMap.pipe(
          map((params) => params.get('oobCode')),
          distinctUntilChanged()
        )
      ),
    })),

    withMethods((innerStore) => ({
      verifyEmailFromRoute: rxMethod<void>(
        pipe(
          exhaustMap(() => {
            innerStore.emailVerificationSetLoading();
            console.log(
              '📩 oobCode leído desde la URL:',
              innerStore._oobCode()
            );

            return store._firebaseAuthService
              .verifyEmail(innerStore._oobCode() ?? '')
              .pipe(
                tapResponse({
                  next: () => {
                    console.log(
                      '✅ Firebase confirmó la verificación de correo'
                    );
                    innerStore.emailVerificationSetSuccess();
                  },
                  error: (err: Error) => {
                    console.error(
                      '❌ Error al verificar el correo en Firebase:',
                      err
                    );
                    innerStore.emailVerificationSetError(
                      err?.message ||
                        'Error desconocido al verificar el correo.'
                    );
                  },
                })
              );
          })
        )
      ),
    }))
  );
}
