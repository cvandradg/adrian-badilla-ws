import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MODULES, COMPONENTS } from '@adrian-badilla/ui/shared';
import { firebaseAuthStore } from '../../data-access/stores/auth.store';

@Component({
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.scss'],
  selector: 'adrian-badilla-email-verification',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, MODULES, COMPONENTS],
})
export class EmailVerificationComponent {
    firebaseAuthStore = inject(firebaseAuthStore);


}
