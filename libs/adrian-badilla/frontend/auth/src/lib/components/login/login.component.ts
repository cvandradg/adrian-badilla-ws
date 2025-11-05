import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
} from '@angular/core';
import {
  COMPONENTS,
  Credentials,
  MODULES,
  validations,
} from '@adrian-badilla/ui/shared';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { firebaseAuthStore } from '../../data-access/auth.store';
import { toSignal } from '@angular/core/rxjs-interop';
@Component({
  selector: 'adrian-badilla-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [COMPONENTS, MODULES],
})

export class LoginComponent {
  readonly firebaseAuthStore = inject(firebaseAuthStore);
  router = inject(Router);
  formBuilder = inject(FormBuilder);

  loginInputForm = this.formBuilder.group({
    user: validations(Validators.email),
    pass: validations(),
  });

  credentials = toSignal(this.loginInputForm.valueChanges, {
    initialValue: this.loginInputForm.value,
  }) as Signal<Credentials>;
}
