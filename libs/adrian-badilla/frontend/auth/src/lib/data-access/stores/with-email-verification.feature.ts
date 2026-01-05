import { signalStoreFeature, withMethods, withProps } from '@ngrx/signals';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { distinctUntilChanged, exhaustMap, map, pipe } from 'rxjs';
import { inject } from '@angular/core';
import { FirebaseAuthService } from '@adrian-badilla/ui/shared';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { withCustomCallState } from './with-custom-call-state.feature';
import { User } from 'firebase/auth';

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

            return store._firebaseAuthService.getUserSession().pipe(
              exhaustMap((user) =>
                store._firebaseAuthService
                  .sendEmailVerification(user as User)
                  .pipe(
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

      // checkUserEmailVerified: rxMethod<void>(
      //   pipe(
      //     exhaustMap(() =>
      //       store._firebaseAuthService.getUserSession().pipe(
      //         filter((user): user is User => !!user),

      //         exhaustMap((user) =>
      //           from(user.reload()).pipe(
      //             tap(() => console.log('🔄 Usuario recargado')),
      //             map(() => user)
      //           )
      //         ),

      //         filter((user) => user.emailVerified === true),

      //         tap(() =>
      //           console.log('✅ emailVerified === true, navegando a /dashboard')
      //         ),

      //         exhaustMap(() =>
      //           from(innerStore._router.navigate(['/dashboard']))
      //         )
      //       )
      //     )
      //   )
      // ),
    }))
  );
}
