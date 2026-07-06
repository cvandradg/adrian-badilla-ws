import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { billingStore } from '../../store/billing.store';
import { SubscriptionStatusChipComponent } from '../subscription-status-chip/subscription-status-chip.component';

/**
 * SubscriptionCardComponent
 *
 * Displays the user's current subscription details:
 * plan, status chip, expiration date, and days remaining.
 * Consumes billingStore exclusively. Zero business logic.
 */
@Component({
  selector: 'lib-subscription-card',
  standalone: true,
  imports: [SubscriptionStatusChipComponent, DatePipe],
  templateUrl: './subscription-card.component.html',
  styleUrl: './subscription-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionCardComponent {
  readonly store = inject(billingStore);
}
