import { ActivatedRoute, RouterModule } from '@angular/router';
import { COMPONENTS, MODULES } from '@adrian-badilla/ui/shared';
import { firebaseAuthStore } from '../../data-access/stores/auth.store';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

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
}
