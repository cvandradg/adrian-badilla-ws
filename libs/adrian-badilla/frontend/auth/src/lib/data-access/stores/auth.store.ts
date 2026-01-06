import {
  signalStore,
  signalStoreFeature,
  withFeature,
  withMethods,
  withProps,
} from '@ngrx/signals';
import { withLoginResources } from './with-login.feature';
import { withRegisterResources } from './with-register.feature';
import { withPassResetResources } from './with-pass-reset.feature';
import { withRequestPassResetResources } from './with-request-pass-reset.feature';
import { withEmailVerificationResources } from './with-email-verification.feature';
import { inject } from '@angular/core';
import { Credentials } from '@adrian-badilla/ui/shared';

import {
  UserCredential,
  confirmPasswordReset,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  Auth,
  User,
  user,
  signOut,
  authState,
  deleteUser,
  applyActionCode,
  checkActionCode,
  signInWithPopup,
  GoogleAuthProvider,
  getAdditionalUserInfo,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from '@angular/fire/auth';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, exhaustMap, from } from 'rxjs';

export const firebaseAuthStore = signalStore(
  { providedIn: 'root' },

  withProps(() => {
    const _auth = inject(Auth);
    const _user$ = user(_auth);
    const _authState$ = authState(_auth);
    return { _auth, _user$, _authState$ };
  }),

  withMethods((store) => ({
    getCurrentUser: () => store._user$,

    getUserSession: () => store._authState$,

    signOut: rxMethod<void>(pipe(exhaustMap(() => from(signOut(store._auth))))),

    deleteCurrentUser: rxMethod<User>(
      pipe(exhaustMap((user) => from(deleteUser(user))))
    ),

    additionalUserInfo: (cred: UserCredential) => getAdditionalUserInfo(cred),

    sendEmailVerification: (user: User) => from(sendEmailVerification(user)),

    verifyEmail: (code: string) => from(applyActionCode(store._auth, code)),

    checkOobCode: (oobCode: string) =>
      from(checkActionCode(store._auth, oobCode)),

    recoverPassword: (email: string) =>
      from(sendPasswordResetEmail(store._auth, email)),

    resetPass: (code: string, pass: string) =>
      from(confirmPasswordReset(store._auth, code, pass)),

    login: ({ user, pass }: Credentials) =>
      from(signInWithEmailAndPassword(store._auth, user, pass)),

    googleSignin: () =>
      from(signInWithPopup(store._auth, new GoogleAuthProvider())),

    createAccount: ({ user, pass }: Credentials) =>
      from(createUserWithEmailAndPassword(store._auth, user, pass)),
  })),

  withFeature((store) =>
    signalStoreFeature(
      withLoginResources({ store }),
      withRegisterResources({ store }),
      withPassResetResources({ store }),
      withRequestPassResetResources({ store }),
      withEmailVerificationResources({ store })
    )
  )
);
