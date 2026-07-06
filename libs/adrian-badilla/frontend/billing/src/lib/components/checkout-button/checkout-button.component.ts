import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { billingStore } from '../../store/billing.store';
import type { SubscriptionPlan } from '../../models/subscription.model';

/**
 * CheckoutButtonComponent
 *
 * Smart button that initiates the ONVO checkout flow.
 * Reflects loading state from billingStore.
 * Emits `checkoutStarted` after the checkout URL is ready for consumers
 * that need to perform additional steps before redirecting.
 */
@Component({
  selector: 'lib-checkout-button',
  standalone: true,
  templateUrl: './checkout-button.component.html',
  styleUrl: './checkout-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutButtonComponent {
  readonly store = inject(billingStore);

  /** Target plan to upgrade to. Defaults to 'premium'. */
  readonly plan = input<SubscriptionPlan>('premium');

  /** Label displayed in the button. */
  readonly label = input<string>('Obtener Premium');

  /** Emits the checkout URL once available. Host can redirect or open a new tab. */
  readonly checkoutStarted = output<string>();

  readonly #checkoutPending = signal(false);

  constructor() {
    // Reactively emit checkoutStarted once checkoutUrl is available after
    // this component triggered a checkout. Uses untracked() to read the flag
    // so the effect only re-executes when checkoutUrl changes.
    effect(
      () => {
        const url = this.store.checkoutUrl();
        if (url && untracked(() => this.#checkoutPending())) {
          this.#checkoutPending.set(false);
          this.checkoutStarted.emit(url);
        }
      },
      { allowSignalWrites: true }
    );
  }

  onCheckout(): void {
    this.#checkoutPending.set(true);
    this.store.createCheckout(this.plan());
  }
}
