import { withProps, withMethods, signalStoreFeature } from '@ngrx/signals';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { distinctUntilChanged, exhaustMap, map, pipe } from 'rxjs';
import { inject } from '@angular/core';
import { FirebaseAuthService } from '@adrian-badilla/ui/shared';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { withCustomCallState } from './with-custom-call-state.feature';

export function withRequestPassResetResources({ store }: { store: any }) {
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

            return store._firebaseAuthService
              .resetPass(store.oobCode() ?? '', newPassword)
              .pipe(
                tapResponse({
                  next: () => {
                    console.log('✅ Firebase confirmo el cambio de contraseña');
                    store.requestPassResetSetSuccess();
                  },
                  error: (err: Error) => {
                    console.error('❌ Error en firebase', err);
                    store.requestPassResetSetError(
                      err?.message || 'Error desconocido'
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
