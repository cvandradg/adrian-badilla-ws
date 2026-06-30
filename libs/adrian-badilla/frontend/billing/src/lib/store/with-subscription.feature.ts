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
import type { Subscription } from '../models/subscription.model';
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

      function onSubscriptionNext(subscription: Subscription | null): void {
        patchState(store, { subscription, subscriptionError: null });
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
      };
    })
  );
}
