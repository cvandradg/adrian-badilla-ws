import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { COMPONENTS, MODULES, validations } from '@adrian-badilla/ui/shared';
import { FormBuilder, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { firebaseAuthStore } from '../../data-access/auth.store';



@Component({
  selector: 'adrian-badilla-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, COMPONENTS, MODULES],
})
export class RegisterComponent {
firebaseAuthStore = inject(firebaseAuthStore);


  isPassStrong$ = new Subject<boolean>();

  formBuilder = inject(FormBuilder);

  loginInputForm = this.formBuilder.group({
    user: validations(Validators.email),
    pass: validations(),
  });

  formChangesSignal = toSignal(this.loginInputForm.valueChanges, {
    initialValue: this.loginInputForm.value,
  });

constructor() {
  effect(() => {
    console.log('form changed:', this.formChangesSignal());
  });
}

  get credentials() {
    return {
      user: this.loginInputForm.get('user')?.value as string,
      pass: this.loginInputForm.get('pass')?.value as string,
    };
  }


prueba() {
  this.firebaseAuthStore.createAccount(this.credentials);

  console.log('Datos enviados para crear cuenta:', this.credentials);
}

  }

  // isValidUser$ = this.loginInputForm.valueChanges.pipe(
  //   map(() => !this.loginInputForm.controls.user.invalid)
  // );

  // enableButton$ = combineLatest([this.isValidUser$, this.isPassStrong$]).pipe(
  //   map(([isValidUser, isPassStrong]) => isValidUser && isPassStrong)
  // );

// function toSignal(
//   valueChanges: Observable<
//     Partial<{ user: string | null; pass: string | null }>
//   >,
//   arg1: { initialValue: Partial<{ user: string | null; pass: string | null }> }
// ) {
//   throw new Error('Function not implemented.');
// }
