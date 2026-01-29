import {
  withMethods,
  signalStoreFeature,
  WritableStateSource,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe } from 'rxjs';
import { map, filter, tap, exhaustMap } from 'rxjs/operators';
import { FirebaseAuthOut } from '../utils/firebase-auth';
import { withCustomCallState } from './with-custom-call-state.feature';
import { mapFirebaseAuthErrorToMessage } from '../errors';

type PassResetDeps = WritableStateSource<FirebaseAuthOut['state']> &
  Pick<FirebaseAuthOut['methods'], '_recoverPassword'>;

export function withPassResetResources<T extends PassResetDeps>(store: T) {
  return signalStoreFeature(
    withCustomCallState('passReset'),

    withMethods((innerStore) => ({
      passReset: rxMethod<string>(
        pipe(
          map((email) => email.trim()),
          tap((email) => {
            if (!email) {
              innerStore.passResetSetError(
                "Escribe tu correo arriba y presiona de nuevo 'Recuperar Contraseña."
              );
            }
          }),
          filter((email) => !!email),
          tap(() => innerStore.passResetSetLoading()),
          exhaustMap((email) =>
            store._recoverPassword(email).pipe(
              tapResponse({
                next: () => innerStore.passResetSetSuccess(),
                error: (err: unknown) =>
                  innerStore.passResetSetError(
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
