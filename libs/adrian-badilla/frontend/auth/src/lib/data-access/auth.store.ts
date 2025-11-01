import { signalStore, withMethods, withProps } from '@ngrx/signals';
import {withDevtools} from '@angular-architects/ngrx-toolkit'
import { inject } from '@angular/core';
import { FirebaseAuthService } from '@adrian-badilla/ui/shared';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tap } from 'rxjs';

export const firebaseAuthStore = signalStore(
  {providedIn: 'root'},
  // withDevtools('firebaseAuth'),
  withProps(() => ({
    firebaseAuthService: inject(FirebaseAuthService),
  })),
  withMethods((store) => ({
    googleSignIn: rxMethod<void>( () => store.firebaseAuthService.googleSignin().pipe(
      tap((respuesta) => console.log('hola desdes el metodo googleSignIn', respuesta))
    ))
  }))
);
