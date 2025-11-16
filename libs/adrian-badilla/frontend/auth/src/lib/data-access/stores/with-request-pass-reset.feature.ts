import { inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { FirebaseAuthService } from '@adrian-badilla/ui/shared';
import { map, pipe, exhaustMap, distinctUntilChanged } from 'rxjs';
import { withCustomCallState } from './with-custom-call-state.feature';
import { withProps, withMethods, signalStoreFeature } from '@ngrx/signals';

export function withRequestPassResetResources() {
  return signalStoreFeature(
    withCustomCallState('requestPassReset'),

    withProps((_, route = inject(ActivatedRoute)) => ({
      firebaseAuthService: inject(FirebaseAuthService),
      oobCode: toSignal(
        route.queryParamMap.pipe(
          map((params) => params.get('oobCode')),
          distinctUntilChanged()
        )
      ),
    })),

    withMethods((store) => ({
      resetPassword: rxMethod<{ newPassword: string }>(
        pipe(
          exhaustMap(({ newPassword }) => {
            store.requestPassResetSetLoading();

            return store.firebaseAuthService
              .resetPass(store.oobCode() ?? '', newPassword)
              .pipe(
                tapResponse({
                  next: () => {
                    console.log(
                      '✅ Firebase confirmó el cambio de contraseña.'
                    );
                    store.requestPassResetSetSuccess();
                  },
                  error: (err: Error) => {
                    console.error('❌ Error en Firebase:', err);
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
