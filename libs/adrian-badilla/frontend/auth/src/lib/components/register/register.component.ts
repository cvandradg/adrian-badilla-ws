import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, map, combineLatest } from 'rxjs';
import { provideComponentStore } from '@ngrx/component-store';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { COMPONENTS, MODULES, validations } from '@adrian-badilla/ui/shared';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'adrian-badilla-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, COMPONENTS, MODULES],
})
export class RegisterComponent {
  isPassStrong$ = new Subject<boolean>();

  formBuilder = inject(FormBuilder);

  loginInputForm = this.formBuilder.group({
    user: validations(Validators.email),
    pass: validations(),
  });

  // isValidUser$ = this.loginInputForm.valueChanges.pipe(
  //   map(() => !this.loginInputForm.controls.user.invalid)
  // );

  // enableButton$ = combineLatest([this.isValidUser$, this.isPassStrong$]).pipe(
  //   map(([isValidUser, isPassStrong]) => isValidUser && isPassStrong)
  // );
}
