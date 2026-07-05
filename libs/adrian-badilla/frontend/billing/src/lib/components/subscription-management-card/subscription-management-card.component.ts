import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { billingStore } from '../../store/billing.store';

/**
 * SubscriptionManagementCardComponent
 *
 * Profile card for administering the user's Premium subscription.
 * Displays one of three states:
 *
 *  1. Active Premium (no cancellation pending)
 *     → plan + status + next renewal date + "Cancelar suscripción" button
 *
 *  2. Cancellation scheduled (willExpire = true)
 *     → informational message with access-until date, no action button
 *
 *  3. No active subscription
 *     → informational message + "Suscribirme" button (navigates to /billing/payment)
 *
 * ── Design invariants ──────────────────────────────────────────────────────
 *  - Zero business logic — all state from billingStore.
 *  - Cancel requires confirmation dialog before calling store.cancelSubscription().
 *  - Buttons are disabled while cancelLoading() is true.
 *  - Errors are shown inline below the action button.
 *  - "Suscribirme" only navigates; does NOT modify checkout state.
 */
@Component({
  selector: 'lib-subscription-management-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './subscription-management-card.component.html',
  styleUrl: './subscription-management-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionManagementCardComponent {
  readonly store = inject(billingStore);
  readonly #router = inject(Router);

  /** Controls visibility of the cancel-confirmation dialog. */
  readonly showConfirmDialog = signal(false);

  openCancelDialog(): void {
    this.showConfirmDialog.set(true);
  }

  dismissDialog(): void {
    this.showConfirmDialog.set(false);
  }

  confirmCancel(): void {
    this.showConfirmDialog.set(false);
    this.store.cancelSubscription();
  }

  navigateToBilling(): void {
    this.#router.navigate(['/billing/payment']);
  }
}
