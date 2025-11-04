import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { COMPONENTS, MODULES } from '@adrian-badilla/ui/shared';

@Component({
  selector: 'adrian-badilla-request-pass-reset',
  templateUrl: './request-pass-reset.component.html',
  styleUrls: ['./request-pass-reset.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, MODULES, COMPONENTS],
})
export class RequestPassResetComponent {

  isPassStrong$ = new Subject<boolean>();

  // isValidPassword$ = this.loginInputForm.valueChanges.pipe(
  //   map(() => !this.loginInputForm.controls.pass.invalid)
  // );

  // enableButton$ = combineLatest([
  //   this.isValidPassword$,
  //   this.isPassStrong$,
  // ]).pipe(
  //   map(([isValidPassword, isPassStrong]) => isValidPassword && isPassStrong)
  // );
}
