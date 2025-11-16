import {
  withProps,
  withState,
  patchState,
  withMethods,
  signalStoreFeature,
} from '@ngrx/signals';
import { inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { FirebaseAuthService } from '@adrian-badilla/ui/shared';
import { of, map, pipe, exhaustMap, distinctUntilChanged } from 'rxjs';

export function withRequestPassResetResources() {
  return signalStoreFeature(
    withState({
      isReseting: false,
      resetedSuccess: false,
      error: null as string | null,
    }),

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
            patchState(store, {
              isReseting: true,
              resetedSuccess: false,
              error: null,
            });

            return store.firebaseAuthService
              .resetPass(store.oobCode() ?? '', newPassword)
              .pipe(
                tapResponse({
                  next: () => {
                    console.log(
                      '✅ Firebase confirmó el cambio de contraseña.'
                    );
                    patchState(store, {
                      isReseting: false,
                      resetedSuccess: true,
                    });
                  },
                  error: (err: Error) => {
                    console.error('❌ Error en Firebase:', err);
                    patchState(store, {
                      isReseting: false,
                      error: err?.message || 'Error desconocido',
                    });
                    return of(null);
                  },
                })
              );
          })
        )
      ),
    }))
  );
}
