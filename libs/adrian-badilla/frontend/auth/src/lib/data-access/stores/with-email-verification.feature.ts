import { signalStoreFeature, withMethods, withProps } from '@ngrx/signals';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { distinctUntilChanged, exhaustMap, map, pipe } from 'rxjs';
import { inject } from '@angular/core';
import { FirebaseAuthService } from '@adrian-badilla/ui/shared';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { withCustomCallState } from './with-custom-call-state.feature';

export function withEmailVerificationResources() {
  return signalStoreFeature(
    withCustomCallState('emailVerification'),

    withProps(
      (
        _,
        route = inject(ActivatedRoute),
      ) => ({
        _firebaseAuthService:inject(FirebaseAuthService),
        _oobCode: toSignal(
          route.queryParamMap.pipe(
            map((params) => params.get('oobCode')),
            distinctUntilChanged()
          )
        ),
      })
    ),

    withMethods((store) => ({
      verifyEmailFromRoute: rxMethod<void>(
        pipe(
          exhaustMap(() => {
            store.emailVerificationSetLoading();

            console.log('📩 oobCode leído desde la URL:', store._oobCode());

            return store._firebaseAuthService
              .verifyEmail(store._oobCode() ?? '')
              .pipe(
                tapResponse({
                  next: () => {
                    console.log(
                      '✅ Firebase confirmó la verificación de correo'
                    );
                    store.emailVerificationSetSuccess();
                  },
                  error: (err: Error) => {
                    console.error(
                      '❌ Error al verificar el correo en Firebase:',
                      err
                    );
                    store.emailVerificationSetError(
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
