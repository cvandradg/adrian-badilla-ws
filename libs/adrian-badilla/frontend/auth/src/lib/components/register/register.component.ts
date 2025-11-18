import {
  inject,
  Component,
  ChangeDetectionStrategy,
  Signal,
} from '@angular/core';
import {
  COMPONENTS,
  Credentials,
  MODULES,
  validations,
} from '@adrian-badilla/ui/shared';
import { RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { firebaseAuthStore } from '../../data-access/stores/auth.store';

@Component({
  selector: 'adrian-badilla-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, COMPONENTS, MODULES],
})
export class RegisterComponent {
  formBuilder = inject(FormBuilder);
  firebaseAuthStore = inject(firebaseAuthStore);

  loginInputForm = this.formBuilder.group({
    user: validations(Validators.email),
    pass: validations(),
  });

  credentials = toSignal(this.loginInputForm.valueChanges, {
    initialValue: this.loginInputForm.value,
  }) as Signal<Credentials>;
}
