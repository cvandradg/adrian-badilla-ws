import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { COMPONENTS, MODULES } from '@adrian-badilla/ui/shared';
import { firebaseAuthStore } from '../../data-access/stores/auth.store';

@Component({
  selector: 'adrian-badilla-request-pass-reset',
  templateUrl: './request-pass-reset.component.html',
  styleUrls: ['./request-pass-reset.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, MODULES, COMPONENTS],
})
export class RequestPassResetComponent {
  route = inject(ActivatedRoute);
  firebaseAuthStore = inject(firebaseAuthStore);

  isPassStrong$ = new Subject<boolean>();

  oobCode = 'TEST_CODE_123';
  newPassword = 'TEST_PASS_123';
}
