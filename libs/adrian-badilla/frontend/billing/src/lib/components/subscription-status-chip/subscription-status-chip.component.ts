import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { SubscriptionStatus } from '../../models/subscription.model';

/**
 * SubscriptionStatusChipComponent
 *
 * Purely presentational chip that visualizes a SubscriptionStatus value.
 * Accepts status as an @input() — no store injection — making it portable
 * in any context (payment history list, admin views, etc.).
 */
@Component({
  selector: 'lib-subscription-status-chip',
  standalone: true,
  templateUrl: './subscription-status-chip.component.html',
  styleUrl: './subscription-status-chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionStatusChipComponent {
  readonly status = input.required<SubscriptionStatus>();
}
