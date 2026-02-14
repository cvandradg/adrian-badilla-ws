import {
  inject,
  Signal,
  Component,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import { MODULES, COMPONENTS, validations, Credentials } from '@adrian-badilla/ui/shared';
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
export class LoginComponent implements OnInit {
  readonly firebaseAuthStore = inject(firebaseAuthStore);
  readonly formBuilder = inject(FormBuilder);

  readonly loginInputForm = this.formBuilder.group({
    user: validations(Validators.email),
    pass: validations(),
  });

  readonly credentials = toSignal(this.loginInputForm.valueChanges, {
    initialValue: this.loginInputForm.value,
  }) as Signal<Credentials>;

  ngOnInit(): void {
    this.firebaseAuthStore.resetLoginUi();
  }
}
