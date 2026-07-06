import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { Auth, authState } from '@angular/fire/auth';
import { pipe, switchMap, distinctUntilChanged, map } from 'rxjs';
import type { CheckoutPhase, Subscription } from '../models/subscription.model';
import type { PaymentRecord } from '../models/payment.model';
import {
  PLAN_FEATURE_MAP,
  type FeatureName,
} from '../config/plan-features.config';
import { SubscriptionRepository } from '../repositories/subscription.repository';

// ─── State ────────────────────────────────────────────────────────────────────

interface SubscriptionState {
  subscription: Subscription | null | undefined;
  paymentHistory: PaymentRecord[];
  subscriptionError: string | null;
  /**
   * Phase of the checkout session, owned by this feature so that onSubscriptionNext
   * can reset it when Firestore delivers a definitive result.
   *
   * Transitions:
   *   idle       → no active session; paymentFlowState reflects Firestore directly
   *   filling    → user explicitly chose to fill / retry the form
   *   processing → startPaymentFlow() is in flight (ONVO + callable + awaiting webhook)
   *
   * Written by:
   *   withCheckoutFeature.startPaymentFlow()  idle/filling → processing
   *   withCheckoutFeature.retryPayment()      idle         → filling
   *   onSubscriptionNext                      processing   → idle (on definitive result)
   */
  checkoutPhase: CheckoutPhase;
}

// ─── Normalization ────────────────────────────────────────────────────────────

/**
 * Normalizes the raw Firestore subscription document to an unambiguous status.
 *
 * Firestore (via persistSubscriptionState) writes `status: 'incomplete'` as a
 * transitional value. The webhook handlers then update it to a definitive status,
 * but the intermediate 'incomplete' document is ambiguous:
 *   - incomplete + lastPaymentError   → payment was rejected  (normalized: 'failed')
 *   - incomplete + no lastPaymentError → waiting for webhook  (normalized: 'pending')
 *
 * This function is the single source of that mapping. Once normalized, the store
 * never sees 'incomplete' and paymentFlowState() can use status directly.
 */
function normalizeSubscription(raw: Subscription | null): Subscription | null {
  if (!raw) return null;
  if (raw.status === 'incomplete') {
    return {
      ...raw,
      status: raw.lastPaymentError != null ? 'failed' : 'pending',
    };
  }
  return raw;
}

// ─── Feature ──────────────────────────────────────────────────────────────────

/**
 * withSubscriptionFeature
 *
 * Responsible for:
 *  - Watching `users/{uid}.subscription` via Firestore onSnapshot.
 *  - Keeping subscription state reactive and in sync with Firestore.
 *  - Exposing all subscription-derived computed signals.
 *  - Loading payment history on demand.
 *
 * `initialize()` must be called explicitly (e.g. from provideAppInitializer).
 * It switches the onSnapshot listener whenever the authenticated userId changes.
 *
 * Dependencies: @angular/fire/auth, SubscriptionRepository — both portable.
 */
export function withSubscriptionFeature() {
  return signalStoreFeature(
    withProps(() => ({
      _auth: inject(Auth),
      _subRepo: inject(SubscriptionRepository),
    })),

    withState<SubscriptionState>({
      subscription: undefined, // undefined = not yet loaded
      paymentHistory: [],
      subscriptionError: null,
      checkoutPhase: 'idle',
    }),

    withComputed((s) => ({
      /**
       * True only when the user has an active premium subscription.
       *
       * ONVO Loop does not send an `expiresAt` field — expiry is tracked via
       * `currentPeriodEnd` and enforced server-side by `syncSubscriptionStatus`
       * and the renewal webhooks.  Checking `expiresAt` here caused isPremium
       * to always return false because the field was never populated by ONVO.
       *
       * The source of truth for subscription validity is:
       *   plan === 'premium' AND status === 'active'
       *
       * `syncSubscriptionStatus` (Cloud Function, daily) transitions
       * status → 'past_due' when currentPeriodEnd has passed without renewal.
       */
      isPremium: computed(() => {
        const sub = s.subscription();
        return sub?.plan === 'premium' && sub?.status === 'active';
      }),

      /** True when subscription status is 'active' (any plan). */
      isActive: computed(() => s.subscription()?.status === 'active'),

      /**
       * True when the current billing period has ended.
       * Prefers `currentPeriodEnd` (ONVO Loop); falls back to legacy `expiresAt`
       * so existing documents continue to work during the transition.
       */
      isExpired: computed(() => {
        const sub = s.subscription();
        const periodEnd = sub?.currentPeriodEnd ?? sub?.expiresAt ?? null;
        if (!periodEnd) return false;
        return periodEnd.toDate().getTime() < Date.now();
      }),

      /**
       * Number of days remaining in the current billing period.
       * Returns 0 when expired, no subscription, or status is not 'active'.
       * Prefers `currentPeriodEnd`; falls back to legacy `expiresAt`.
       */
      daysRemaining: computed(() => {
        const sub = s.subscription();
        if (sub?.status !== 'active') return 0;
        const periodEnd = sub?.currentPeriodEnd ?? sub?.expiresAt ?? null;
        if (!periodEnd) return 0;
        const diff = periodEnd.toDate().getTime() - Date.now();
        return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
      }),

      /** The current plan name. Defaults to 'free' when no subscription. */
      currentPlan: computed(() => s.subscription()?.plan ?? 'free'),

      /**
       * Returns a function that checks if a named feature is accessible
       * under the current active plan.
       *
       * Usage in template: store.hasFeature()('ai')
       * Usage in TS:       store.hasFeature()('unlimitedRoutines')
       */
      hasFeature: computed(() => (featureName: FeatureName) => {
        const plan = s.subscription()?.plan ?? 'free';
        const status = s.subscription()?.status;
        return status === 'active' && PLAN_FEATURE_MAP[plan].has(featureName);
      }),

      /** True while subscription state is being resolved (initial load). */
      isSubscriptionLoading: computed(() => s.subscription() === undefined),

      /**
       * True when the subscription is active but renewal has been cancelled
       * and the current paid period has not yet ended.
       *
       * This means the user still has full Premium access but it will end
       * automatically when `currentPeriodEnd` is reached.
       * Drives the "Tu suscripción finalizará el [date]" notice in the UI.
       */
      willExpire: computed(() => {
        const sub = s.subscription();
        if (sub?.status !== 'active') return false;
        if (sub?.cancelAtPeriodEnd !== true) return false;
        const periodEnd = sub?.currentPeriodEnd ?? sub?.expiresAt ?? null;
        if (!periodEnd) return false;
        const endDate =
          periodEnd instanceof Date ? periodEnd : periodEnd.toDate();
        return endDate.getTime() > Date.now();
      }),

      /**
       * The date when Premium access will end due to a pending cancellation.
       * Returns null when there is no scheduled cancellation.
       * Use alongside `willExpire` to show "Tu suscripción finalizará el [date]".
       */
      expirationDate: computed((): Date | null => {
        const sub = s.subscription();
        if (!sub?.cancelAtPeriodEnd) return null;
        const periodEnd = sub?.currentPeriodEnd ?? sub?.expiresAt ?? null;
        if (!periodEnd) return null;
        return periodEnd instanceof Date ? periodEnd : periodEnd.toDate();
      }),

      /**
       * True only when the subscription is fully active and the billing period
       * has not yet expired.
       *
       * Stricter than `isPremium`: also validates `currentPeriodEnd > now`.
       * When `currentPeriodEnd` is absent (legacy docs), the period is assumed
       * active — the server-side `syncSubscriptionStatus` function is the
       * authoritative expiry enforcer.
       *
       * Use this signal to gate premium content loading and display rules.
       * Flow gates:
       *   subscription === undefined  → isSubscriptionLoading() = true  (skeleton)
       *   subscription === null       → isSubscriptionActive() = false  (paywall)
       *   plan !== 'premium'          → isSubscriptionActive() = false  (paywall)
       *   status !== 'active'         → isSubscriptionActive() = false  (paywall)
       *   currentPeriodEnd < now      → isSubscriptionActive() = false  (paywall)
       *   all checks pass             → isSubscriptionActive() = true   (load content)
       */
      isSubscriptionActive: computed(() => {
        const sub = s.subscription();
        if (sub?.plan !== 'premium' || sub?.status !== 'active') return false;
        const periodEnd = sub.currentPeriodEnd ?? null;
        if (!periodEnd) return true; // no expiry date → trust server-side enforcement
        // Guard: Firestore SDK returns Timestamp objects; plain Date can appear in
        // test/mock environments.  Never compare a Timestamp directly with > or <
        // against a Date/number — that compares object references, always false.
        const endDate =
          periodEnd instanceof Date ? periodEnd : periodEnd.toDate();
        return endDate.getTime() > Date.now();
      }),
    })),

    withMethods((store) => {
      // ── Extracted handlers to stay within nesting-depth lint rules ──────────

      function onSubscriptionNext(raw: Subscription | null): void {
        const subscription = normalizeSubscription(raw);

        // Debug-only log — excluded from production builds to avoid exposing
        // payment error details (lastPaymentError) in the browser console.
        // Use "Verbose" level in DevTools to see these messages during development.
        // eslint-disable-next-line no-console
        console.debug('[BILLING:dev] subscription update', {
          rawStatus: raw?.status ?? null,
          normalizedStatus: subscription?.status ?? null,
          plan: subscription?.plan ?? null,
        });

        // Reset checkoutPhase to 'idle' when Firestore delivers a definitive result:
        //   'active'  → payment-intent.succeeded webhook confirmed the payment
        //   'failed'  → payment-intent.failed webhook rejected the payment
        //             (normalized from 'incomplete' + lastPaymentError above)
        // Transitional states ('pending', 'incomplete' without error) keep the
        // current checkoutPhase so 'processing' UI state is maintained.
        const isDefinitive =
          subscription?.status === 'active' ||
          subscription?.status === 'failed';
        const checkoutPhase = isDefinitive ? 'idle' : store.checkoutPhase();

        patchState(store, {
          subscription,
          subscriptionError: null,
          checkoutPhase,
        });
      }

      function onSubscriptionError(err: unknown): void {
        console.error('[billing] watchSubscription$ error', err);
        patchState(store, {
          subscriptionError: 'No se pudo cargar la suscripción.',
        });
      }

      function onRefreshError(err: unknown): void {
        console.error('[billing] refreshSubscription error', err);
        patchState(store, {
          subscriptionError: 'Error al actualizar la suscripción.',
        });
      }

      function onPaymentHistoryNext(paymentHistory: PaymentRecord[]): void {
        patchState(store, { paymentHistory });
      }

      function watchForUid(uid: string | null) {
        if (!uid) {
          patchState(store, {
            subscription: null,
            paymentHistory: [],
            subscriptionError: null,
          });
          return [];
        }
        return store._subRepo.watchSubscription$(uid).pipe(
          tapResponse({
            next: onSubscriptionNext,
            error: onSubscriptionError,
          })
        );
      }

      return {
        /**
         * Starts the real-time Firestore listener for the authenticated user.
         * Switches to a new listener whenever userId changes.
         * Call once from provideAppInitializer or app root.
         */
        initialize: rxMethod<void>(
          pipe(
            switchMap(() =>
              authState(store._auth).pipe(
                map((user) => user?.uid ?? null),
                distinctUntilChanged(),
                switchMap(watchForUid)
              )
            )
          )
        ),

        /**
         * Forces a one-shot read of the subscription from Firestore.
         * Uses getDoc (not onSnapshot) to avoid opening a second listener (I-1).
         * Useful after returning from checkout to confirm payment status.
         */
        refreshSubscription: rxMethod<string>(
          pipe(
            switchMap((uid) =>
              store._subRepo.getSubscriptionOnce(uid).pipe(
                tapResponse({
                  next: onSubscriptionNext,
                  error: onRefreshError,
                })
              )
            )
          )
        ),

        /**
         * Loads the payment history for the given user.
         * Populates `paymentHistory` signal.
         */
        loadPaymentHistory: rxMethod<string>(
          pipe(
            switchMap((uid) =>
              store._subRepo.getPaymentHistory(uid).pipe(
                tapResponse({
                  next: onPaymentHistoryNext,
                  error: (err: unknown) =>
                    console.error('[billing] loadPaymentHistory error', err),
                })
              )
            )
          )
        ),

        /**
         * Sets the checkout phase. Called by withCheckoutFeature methods
         * (startPaymentFlow, retryPayment) via WritableStateSource cast since
         * checkoutPhase lives in this feature's state.
         *
         * Also used internally by onSubscriptionNext to reset to 'idle' when
         * a definitive Firestore result arrives.
         */
        setCheckoutPhase(phase: CheckoutPhase): void {
          patchState(store, { checkoutPhase: phase });
        },
      };
    })
  );
}
