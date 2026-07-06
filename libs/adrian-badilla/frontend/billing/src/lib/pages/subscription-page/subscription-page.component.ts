import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { billingStore } from '../../store/billing.store';
import { SubscriptionCardComponent } from '../../components/subscription-card/subscription-card.component';
import { PremiumBannerComponent } from '../../components/premium-banner/premium-banner.component';

/**
 * SubscriptionPageComponent
 *
 * Route: /billing
 * Displays the user's subscription overview, plan management options,
 * and upgrade prompt when on the free plan.
 * Delegates all state and actions to billingStore.
 */
@Component({
  selector: 'lib-subscription-page',
  standalone: true,
  imports: [SubscriptionCardComponent, PremiumBannerComponent, DatePipe],
  templateUrl: './subscription-page.component.html',
  styleUrl: './subscription-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionPageComponent {
  readonly store = inject(billingStore);

  /** Show cancel only when active AND no cancellation is already pending. */
  readonly showCancelOption = computed(
    () => this.store.isActive() && !this.store.willExpire()
  );

  onCheckoutStarted(url: string): void {
    globalThis.window?.location.assign(url);
  }

  onCancelSubscription(): void {
    this.store.cancelSubscription();
  }
}
