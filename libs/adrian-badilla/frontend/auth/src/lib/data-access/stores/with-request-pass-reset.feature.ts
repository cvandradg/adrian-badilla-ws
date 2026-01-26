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
import { distinctUntilChanged, exhaustMap, map, pipe } from 'rxjs';
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
        )
      ),
    })),

    withMethods((innerStore) => ({
      resetPassword: rxMethod<{ newPassword: string }>(
        pipe(
          exhaustMap(({ newPassword }) => {
            innerStore.requestPassResetSetLoading();

            return store
              ._resetPass(innerStore.oobCode() ?? '', newPassword)
              .pipe(
                tapResponse({
                  next: () => {
                    console.log('✅ Firebase confirmo el cambio de contraseña');
                    innerStore.requestPassResetSetSuccess();
                  },
                  error: (err: unknown) =>
                    innerStore.requestPassResetSetError(
                      mapFirebaseAuthErrorToMessage(err)
                    ),
                })
              );
          })
        )
      ),
    }))
  );
}
