import { Component, inject, input } from '@angular/core';
import { COMPONENTS, MODULES } from '@adrian-badilla/ui/shared';
import { firebaseAuthStore } from '../../data-access/stores/auth.store';

@Component({
  selector: 'adrian-badilla-pass-reset',
  templateUrl: './pass-reset.component.html',
  styleUrls: ['./pass-reset.component.scss'],
  imports: [MODULES, COMPONENTS],
})
export class PassResetComponent {
  readonly firebaseAuthStore = inject(firebaseAuthStore);

  /** Required: the email address to prefill in the reset form. */
  readonly user = input.required<string>();
}
