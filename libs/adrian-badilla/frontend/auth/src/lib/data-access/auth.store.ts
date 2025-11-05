import { signalStore, withMethods, withProps } from '@ngrx/signals';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { inject } from '@angular/core';
import { Credentials, FirebaseAuthService } from '@adrian-badilla/ui/shared';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { exhaustMap, pipe, tap } from 'rxjs';

export const firebaseAuthStore = signalStore(
  { providedIn: 'root' },
  // withDevtools('firebaseAuth'),
  withProps(() => ({
    firebaseAuthService: inject(FirebaseAuthService),
  })),
  withMethods((store) => ({
    googleSignIn: rxMethod<void>(
      pipe(
        exhaustMap(() => store.firebaseAuthService.googleSignin()),
        tap((respuesta) =>
          console.log('Respuesta de Google Sign-In:', respuesta)
        )
      )
    ),

    createAccount: rxMethod<Credentials>(
      pipe(
        exhaustMap((creds) => store.firebaseAuthService.createAccount(creds)),
        tap((resp) => console.log('Cuenta creada Firebase:', resp))
      )
    ),
  }))
);
