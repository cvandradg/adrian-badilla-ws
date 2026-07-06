import {
  inject,
  Signal,
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  MODULES,
  COMPONENTS,
  validations,
  Credentials,
} from '@adrian-badilla/ui/shared';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { firebaseAuthStore } from '../../data-access/stores/auth.store';
import { PassResetComponent } from '../pass-reset/pass-reset.component';

@Component({
  selector: 'adrian-badilla-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [COMPONENTS, MODULES, PassResetComponent],
})
export class LoginComponent {
  readonly firebaseAuthStore = inject(firebaseAuthStore);
  readonly formBuilder = inject(FormBuilder);

  readonly loginInputForm = this.formBuilder.group({
    user: validations(Validators.email),
    pass: validations(),
  });

  readonly credentials = toSignal(this.loginInputForm.valueChanges, {
    initialValue: this.loginInputForm.value,
  }) as Signal<Credentials>;

  /** Reset login UI state on component init — replaces ngOnInit. */
  readonly #reset = this.firebaseAuthStore.resetLoginUi();
}
