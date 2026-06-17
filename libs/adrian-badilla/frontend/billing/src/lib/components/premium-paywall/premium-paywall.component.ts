import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { billingStore } from '../../store/billing.store';
import { PremiumBannerComponent } from '../premium-banner/premium-banner.component';

/**
 * PremiumPaywallComponent
 *
 * Content projection wrapper. Shows premium content via `<ng-content>` when
 * the user has an active premium subscription, or the PremiumBanner otherwise.
 *
 * Usage:
 *   <lib-premium-paywall>
 *     <your-premium-feature />
 *   </lib-premium-paywall>
 */
@Component({
  selector: 'lib-premium-paywall',
  standalone: true,
  imports: [PremiumBannerComponent],
  templateUrl: './premium-paywall.component.html',
  styleUrl: './premium-paywall.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PremiumPaywallComponent {
  readonly store = inject(billingStore);
}
