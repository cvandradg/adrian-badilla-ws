import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, map, combineLatest } from 'rxjs';
import { provideComponentStore } from '@ngrx/component-store';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { COMPONENTS, MODULES } from '@adrian-badilla/ui/shared';
import { BaseComponent } from '../../../../../shared/src/lib/classes/base-component';
import { RegisterStore } from './register.store';

@Component({
  selector: 'adrian-badilla-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, COMPONENTS, MODULES],
  // providers: [provideComponentStore(RegisterStore)],
})
export class RegisterComponent extends BaseComponent {
  readonly registerStore = inject(RegisterStore);

  isPassStrong$ = new Subject<boolean>();

  isValidUser$ = this.loginInputForm.valueChanges.pipe(
    map(() => !this.loginInputForm.controls.user.invalid)
  );

  enableButton$ = combineLatest([this.isValidUser$, this.isPassStrong$]).pipe(
    map(([isValidUser, isPassStrong]) => isValidUser && isPassStrong)
  );
}
