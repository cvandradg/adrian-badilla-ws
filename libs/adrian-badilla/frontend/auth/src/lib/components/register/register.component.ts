import {
  effect,
  inject,
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  MODULES,
  COMPONENTS,
  Credentials,
  validations,
} from '@adrian-badilla/ui/shared';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { firebaseAuthStore } from '../../data-access/auth.store';

@Component({
  selector: 'adrian-badilla-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, COMPONENTS, MODULES],
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
  }) as () => Credentials;

  constructor() {
    effect(() => {
      console.log('form credentials:', this.credentials());
    });
  }
}

// isValidUser$ = this.loginInputForm.valueChanges.pipe(
//   map(() => !this.loginInputForm.controls.user.invalid)
// );

// enableButton$ = combineLatest([this.isValidUser$, this.isPassStrong$]).pipe(
//   map(([isValidUser, isPassStrong]) => isValidUser && isPassStrong)
// );

