import { computed } from '@angular/core';
import { signalStore, withComputed } from '@ngrx/signals';
import { withSubscriptionFeature } from './with-subscription.feature';
import { withCheckoutFeature } from './with-checkout.feature';
import type { PaymentFlowState } from '../models/subscription.model';

/**
 * billingStore
 *
 * Single source of truth for all billing and subscription state.
 * Composed from two internal features:
 *
 *  - withSubscriptionFeature: real-time Firestore sync, computed selectors
 *  - withCheckoutFeature: ONVO Pay checkout flow, verification, cancellation
 *
 * ── Portability ──────────────────────────────────────────────────────────────
 * This store has ZERO dependencies on project-specific libs.
 * All deps are from: @angular/fire, firebase, @ngrx/signals, rxjs.
 * Copy the entire `billing/` lib to any Angular + Firebase project and it works.
 *
 * ── Initialization ───────────────────────────────────────────────────────────
 * Call `inject(billingStore).initialize()` in `provideAppInitializer`.
 * This starts the Firestore onSnapshot listener and keeps it reactive
 * to auth changes (login, logout, session restore).
 *
 * ── Security invariant ───────────────────────────────────────────────────────
 * Premium is never activated from this store or any Angular code.
 * The only activation path is:
 *   ONVO webhook → Firebase Function → Firestore → onSnapshot → store reflects change
 */
export const billingStore = signalStore(
  { providedIn: 'root' },
  withSubscriptionFeature(),
  withCheckoutFeature(),
  withComputed((store) => ({
    /**
     * True while the user has initiated payment verification but the
     * subscription is not yet active.
     * Resolves automatically (C-3) when Firestore onSnapshot fires with
     * status='active' — no manual patchState required.
     */
    pendingVerification: computed(
      () => store.verifyLoading() && !store.isActive()
    ),

    /**
     * Single authoritative state for the payment form UI.
     * All payment form template logic reads ONLY this signal.
     *
     * Priority order:
     *  1. Firestore-confirmed terminal outcomes (always win)
     *  2. Active checkout session in flight (checkoutPhase = 'processing')
     *  3. User explicitly filling/retrying the form (checkoutPhase = 'filling')
     *  4. Idle — reflect Firestore failure if present
     *  5. Default: show form (no subscription, pending, or loading)
     */
    paymentFlowState: computed((): PaymentFlowState => {
      const sub = store.subscription();

      // Priority 1: Firestore terminal outcomes always win, regardless of
      // checkout phase. Once the webhook fires, the session is over.
      if (sub?.status === 'active') return 'success';
      if (sub?.status === 'past_due') return 'past_due';
      if (sub?.status === 'cancelled') return 'cancelled';

      // Priority 2: Active checkout session in flight.
      // startPaymentFlow sets this; onSubscriptionNext resets it to 'idle'
      // when Firestore delivers 'active' or 'failed'.
      if (store.checkoutPhase() === 'processing') return 'processing';

      // Priority 3: User explicitly chose to fill the payment form.
      // Set by retryPayment(). Takes precedence over the Firestore 'failed'
      // state so the retry form is shown even before Firestore is updated.
      if (store.checkoutPhase() === 'filling') return 'form';

      // Priority 4: Idle — reflect Firestore failure state.
      // checkoutPhase was reset to 'idle' by onSubscriptionNext when this
      // 'failed' status arrived, so the session is definitively over.
      if (sub?.status === 'failed') return 'failed';

      // Default: no subscription, pending, inactive, or still loading → form.
      return 'form';
    }),

    /**
     * User-facing error message from the most recent failed payment.
     * Sourced from subscription.lastPaymentError.message (set by webhook).
     * Returns null when no payment error exists.
     * Only relevant when paymentFlowState() === 'failed'.
     */
    lastPaymentErrorMessage: computed(() => {
      const sub = store.subscription();
      return sub?.lastPaymentError?.message ?? null;
    }),
  }))
);

/** Convenience type alias for injection and type annotations. */
export type BillingStore = InstanceType<typeof billingStore>;
