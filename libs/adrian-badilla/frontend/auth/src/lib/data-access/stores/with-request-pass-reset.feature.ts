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

export function withRequestPassResetResources() {
  return signalStoreFeature(
    withState({
      loading: false,
      requested: false,
      error: null as string | null,
    }),

    withProps(() => ({
      firebaseAuthService: inject(FirebaseAuthService),
    })),

    withMethods(() => ({
      resetPassword: rxMethod<{ oobCode: string; newPassword: string }>(
        tap(({ oobCode, newPassword }) => {
          console.log('resetPassword() fue llamado');
          console.log('oobCode recibido:', oobCode);
          console.log('newPassword recibida:', newPassword);
        })
      ),
    }))
  );
}
