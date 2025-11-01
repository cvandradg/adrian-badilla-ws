import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { COMPONENTS, Credentials, MODULES, validations } from '@adrian-badilla/ui/shared';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
// import { LoginStore } from './login.store';

@Component({
  selector: 'adrian-badilla-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [COMPONENTS, MODULES],
  // providers: [provideComponentStore(LoginStore)],
})
export class LoginComponent{
  // readonly loginStore = inject(LoginStore);
    router = inject(Router);
  formBuilder = inject(FormBuilder);

  loginInputForm = this.formBuilder.group({
    user: validations(Validators.email),
    pass: validations(),
  });

  get credentials(): Credentials {
    return {
      user: this.loginInputForm.get('user')?.value as string,
      pass: this.loginInputForm.get('pass')?.value as string,
    };
  }
}
