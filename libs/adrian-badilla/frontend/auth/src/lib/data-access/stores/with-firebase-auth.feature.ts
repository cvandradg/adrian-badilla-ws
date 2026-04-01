import {
  withProps,
  withMethods,
  withComputed,
  signalStoreFeature,
} from '@ngrx/signals';
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
import { from, Observable } from 'rxjs';
import { computed, inject } from '@angular/core';
import { Credentials } from '@adrian-badilla/ui/shared';

export function withFirebaseAuth() {
  return signalStoreFeature(
    withProps(() => ({
      _auth: inject(Auth),
    })),

    withComputed((store) => ({
      _user$: computed(() => user(store._auth)),
      _getUserSession$: computed(() => authState(store._auth)),
    })),

    withMethods((store) => ({
      _signOut: () => from(signOut(store._auth)),

      _deleteCurrentUser: (user: User) => from(deleteUser(user)),

      _verifyEmail: (code: string) => from(applyActionCode(store._auth, code)),

      _sendEmailVerification: (user: User) => from(sendEmailVerification(user)),

      _additionalUserInfo: (user: UserCredential) =>
        getAdditionalUserInfo(user),

      _checkOobCode: (oobCode: string) =>
        from(checkActionCode(store._auth, oobCode)),

      _recoverPassword: (email: string) =>
        from(sendPasswordResetEmail(store._auth, email)),

      _resetPass: (code: string, pass: string) =>
        from(confirmPasswordReset(store._auth, code, pass)),

      _googleSignin: (): Observable<UserCredential> =>
        from(signInWithPopup(store._auth, new GoogleAuthProvider())),

      _login: ({ user, pass }: Credentials): Observable<UserCredential> =>
        from(signInWithEmailAndPassword(store._auth, user, pass)),

      _createAccount: ({
        user,
        pass,
      }: Credentials): Observable<UserCredential> =>
        from(createUserWithEmailAndPassword(store._auth, user, pass)),
    }))
  );
}
