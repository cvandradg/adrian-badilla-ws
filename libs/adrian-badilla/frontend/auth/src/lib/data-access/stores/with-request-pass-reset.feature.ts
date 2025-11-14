import {
  withProps,
  withState,
  patchState,
  withMethods,
  signalStoreFeature,
} from '@ngrx/signals';

import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, exhaustMap, of, pipe, tap } from 'rxjs';
import { inject } from '@angular/core';
import { FirebaseAuthService } from '@adrian-badilla/ui/shared';
import { ActivatedRoute } from '@angular/router';

export function withRequestPassResetResources() {
  return signalStoreFeature(
    withState({
      loading: false,
      reseted: false,
      error: null as string | null,
      oobCode: '',
    }),

    withProps(() => ({
      firebaseAuthService: inject(FirebaseAuthService),
      route: inject(ActivatedRoute),
    })),

    withMethods((store) => ({
      initOobCode: rxMethod<void>(
        tap(() => {
          const code = store.route.snapshot.queryParamMap.get('oobCode') || '';
          console.log('🔑 oobCode recibido desde la URL:', code);
          patchState(store, { oobCode: code });
        })
      ),

      resetPassword: rxMethod<{ oobCode: string; newPassword: string }>(
        pipe(
          tap(() => {
            console.log('🔄 Enviando petición real a Firebase…');
            patchState(store, {
              loading: true,
              reseted: false,
              error: null,
            });
          }),

          exhaustMap(({ oobCode, newPassword }) =>
            store.firebaseAuthService.resetPass(oobCode, newPassword).pipe(
              tap(() => {
                console.log('✅ Firebase confirmó el cambio de contraseña.');
                patchState(store, {
                  loading: false,
                  reseted: true,
                });
              }),

              catchError((err) => {
                console.error('❌ Error en Firebase:', err);
                patchState(store, {
                  loading: false,
                  error: err?.message || 'Error desconocido',
                });
                return of(null);
              })
            )
          )
        )
      ),
    }))
  );
}
