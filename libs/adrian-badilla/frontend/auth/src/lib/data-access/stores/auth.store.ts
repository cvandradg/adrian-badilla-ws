import { signalStore } from '@ngrx/signals';
import { withLoginResources } from './with-login.feature';
import { withRegisterResources } from './with-register.feature';
import { withPassResetResources } from './with-pass-reset.feature';
import { withRequestPassResetResources } from './with-request-pass-reset.feature';

export const firebaseAuthStore = signalStore(
  { providedIn: 'root' },
  withLoginResources(),
  withRegisterResources(),
  withPassResetResources(),
  withRequestPassResetResources()
);
