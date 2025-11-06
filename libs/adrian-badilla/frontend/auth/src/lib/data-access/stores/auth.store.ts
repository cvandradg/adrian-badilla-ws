import { signalStore, withMethods } from '@ngrx/signals';
import { withLoginResources} from './with-login.feature';
import { withRegisterResources } from './with-register.feature';

export const firebaseAuthStore = signalStore(
  { providedIn: 'root' },
  withLoginResources(),
  withRegisterResources(),
  withMethods((store) => ({
    // createAccount: rxMethod<Credentials>(
    //   pipe(
    //     exhaustMap((creds) => store.firebaseAuthService.createAccount(creds)),
    //     tap((resp) => console.log('Cuenta creada Firebase:', resp))
    //   )
    // ),
  }))
);
