import {
  signalStore,
  signalStoreFeature,
  withFeature,
  withProps,
} from '@ngrx/signals';
import { withLoginResources } from './with-login.feature';
import { withRegisterResources } from './with-register.feature';
import { withPassResetResources } from './with-pass-reset.feature';
import { withRequestPassResetResources } from './with-request-pass-reset.feature';
import { withEmailVerificationResources } from './with-email-verification.feature';
import { inject } from '@angular/core';
import { FirebaseAuthService } from '@adrian-badilla/ui/shared';

export const firebaseAuthStore = signalStore(
  { providedIn: 'root' },
  withProps(() => ({
    _firebaseAuthService: inject(FirebaseAuthService),
  })),

  // withMethods((store) => ({
  //   checkEmailVerification: store._firebaseAuthService.getUserSession(),
  // })),

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
