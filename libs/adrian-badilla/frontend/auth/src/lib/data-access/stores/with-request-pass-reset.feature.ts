import {
  withProps,
  withMethods,
  signalStoreFeature,
  WritableStateSource,
} from '@ngrx/signals';
import { inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { ActivatedRoute } from '@angular/router';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { toSignal } from '@angular/core/rxjs-interop';
import { FirebaseAuthOut } from '../utils/firebase-auth';
import { distinctUntilChanged, exhaustMap, map, pipe, filter, tap } from 'rxjs';
import { withCustomCallState } from './with-custom-call-state.feature';
import { mapFirebaseAuthErrorToMessage } from '../errors';

type RequestPassResetDeps = WritableStateSource<FirebaseAuthOut['state']> &
  Pick<FirebaseAuthOut['methods'], '_resetPass'>;

export function withRequestPassResetResources<T extends RequestPassResetDeps>(
  store: T
) {
  return signalStoreFeature(
    withCustomCallState('requestPassReset'),

    withProps((_, route = inject(ActivatedRoute)) => ({
      oobCode: toSignal(
        route.queryParamMap.pipe(
          map((params) => params.get('oobCode')),
          distinctUntilChanged()
        ),
        { initialValue: null }
      ),
    })),

    withMethods((innerStore) => ({
      resetPassword: rxMethod<{ newPassword: string }>(
        pipe(
          map(({ newPassword }) => ({
            code: innerStore.oobCode(),
            password: newPassword.trim(),
          })),

          tap(({ code, password }) => {
            if (!code) {
              innerStore.requestPassResetSetError(
                'Falta el código de verificación en el enlace.'
              );
            } else if (!password) {
              innerStore.requestPassResetSetError(
                'Escribe una nueva contraseña para continuar.'
              );
            }
          }),

          filter(
            (value): value is { code: string; password: string } =>
              !!value.code && !!value.password
          ),
          tap(() => innerStore.requestPassResetSetLoading()),

          exhaustMap(({ code, password }) =>
            store._resetPass(code, password).pipe(
              tapResponse({
                next: () => innerStore.requestPassResetSetSuccess(),
                error: (err: unknown) =>
                  innerStore.requestPassResetSetError(
                    mapFirebaseAuthErrorToMessage(err)
                  ),
              })
            )
          )
        )
      ),
    }))
  );
}
