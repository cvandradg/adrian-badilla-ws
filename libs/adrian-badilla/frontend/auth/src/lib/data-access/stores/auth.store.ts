import { signalStore, withMethods } from '@ngrx/signals';
import { withLoginResources} from './with-login.feature';
import { withRegisterResources } from './with-register.feature';

export const firebaseAuthStore = signalStore(
  { providedIn: 'root' },
  withLoginResources(),
  withRegisterResources(),
  withMethods(() => ({
  }))
);
