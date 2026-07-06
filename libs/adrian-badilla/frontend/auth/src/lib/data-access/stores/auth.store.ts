import { withLoginResources } from './with-login.feature';
import { withRegisterResources } from './with-register.feature';
import { withPassResetResources } from './with-pass-reset.feature';
import { signalStore, withFeature, signalStoreFeature } from '@ngrx/signals';
import { withRequestPassResetResources } from './with-request-pass-reset.feature';
import { withEmailVerificationResources } from './with-email-verification.feature';
import { withFirebaseAuth } from './with-firebase-auth.feature';
import { withCurrentUser } from './with-current-user.feature';

export const firebaseAuthStore = signalStore(
  { providedIn: 'root' },
  withFirebaseAuth(),

  withFeature((store) =>
    signalStoreFeature(
      withCurrentUser(store),
      withLoginResources(store),
      withRegisterResources(store),
      withPassResetResources(store),
      withRequestPassResetResources(store),
      withEmailVerificationResources(store)
    )
  )
);
