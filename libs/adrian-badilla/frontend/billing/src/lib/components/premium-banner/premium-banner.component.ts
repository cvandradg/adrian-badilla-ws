import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

/**
 * PremiumBannerComponent
 *
 * Promotional banner displayed when the user does not have an active
 * premium subscription. Navigates to /billing/payment (new ONVO Loop flow).
 *
 * Legacy: store.createCheckout() + redirect to ONVO checkout URL has been
 * replaced by router.navigate(['/billing/payment']). The legacy methods remain
 * in the store for rollback purposes but are no longer called from here.
 */
@Component({
  selector: 'lib-premium-banner',
  standalone: true,
  templateUrl: './premium-banner.component.html',
  styleUrl: './premium-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PremiumBannerComponent {
  private readonly router = inject(Router);

  onUpgrade(): void {
    this.router.navigate(['/billing/payment']);
  }
}
