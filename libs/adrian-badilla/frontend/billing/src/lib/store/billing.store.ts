import { computed } from '@angular/core';
import { signalStore, withComputed } from '@ngrx/signals';
import { withSubscriptionFeature } from './with-subscription.feature';
import { withCheckoutFeature } from './with-checkout.feature';

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
  }))
);

/** Convenience type alias for injection and type annotations. */
export type BillingStore = InstanceType<typeof billingStore>;
