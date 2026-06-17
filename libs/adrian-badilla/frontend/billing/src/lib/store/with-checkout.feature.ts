import {
  patchState,
  signalStoreFeature,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap, from, throwError } from 'rxjs';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { computed, inject } from '@angular/core';
import type {
  CheckoutSessionResult,
  CreateCheckoutPayload,
  CreateSubscriptionPayload,
  CreateSubscriptionResult,
  OnvoCardInput,
  OnvoPaymentMethodResponse,
  ResolveCustomerResult,
  SubscriptionPlan,
  VerifyPaymentPayload,
  VerifyPaymentResult,
} from '../models/subscription.model';
import { withCallState } from './with-call-state.feature';

// ─── Constants ────────────────────────────────────────────────────────────────

/** ONVO Pay REST API base URL. Used only for client-side payment method creation. */
const ONVO_API_BASE = 'https://api.onvopay.com';

// ─── State ────────────────────────────────────────────────────────────────────

interface CheckoutState {
  checkoutUrl: string | null;
  checkoutSessionId: string | null;
  customerId: string | null;
  publishableKey: string | null;
  paymentMethodId: string | null;
}

// ─── Feature ──────────────────────────────────────────────────────────────────

/**
 * withCheckoutFeature
 *
 * Responsible for:
 *  - Initiating checkout sessions via Firebase Callable Functions.
 *  - Verifying payment status after the user returns from the payment page.
 *  - Requesting subscription cancellation via Firebase Functions.
 *
 * Security invariant:
 *  - Premium is NEVER activated from this store.
 *  - Activation happens exclusively via webhook → Firebase Function → Firestore.
 *  - This store only reads back the result once Firestore reflects the change.
 *
 * Dependencies: firebase/functions — portable across Angular + Firebase projects.
 */
export function withCheckoutFeature() {
  return signalStoreFeature(
    withCallState('prepare'),
    withCallState('card'),
    withCallState('subscribe'),
    withCallState('checkout'),
    withCallState('verify'),
    withCallState('cancel'),

    withState<CheckoutState>({
      checkoutUrl: null,
      checkoutSessionId: null,
      customerId: null,
      publishableKey: null,
      paymentMethodId: null,
    }),

    withComputed((store) => ({
      /**
       * True when resolveCustomer has returned a customerId.
       * Use as a guard before calling the ONVO SDK or POST /v1/payment-methods.
       */
      hasCustomerId: computed(() => store.customerId() !== null),

      /**
       * True when resolveCustomer has returned a publishableKey.
       * Use as a guard before initialising any ONVO client-side API call.
       */
      hasPublishableKey: computed(() => store.publishableKey() !== null),

      /**
       * True when createPaymentMethod has successfully resolved a paymentMethodId.
       * Use as a guard before calling createSubscription.
       */
      hasPaymentMethodId: computed(() => store.paymentMethodId() !== null),

      /**
       * True when the store is ready to call subscribeCheckout().
       * Requires: paymentMethodId resolved AND no subscription request in flight.
       */
      canSubmitSubscription: computed(
        () => store.paymentMethodId() !== null && !store.subscribeLoading()
      ),
    })),

    withMethods((store) => {
      const functions = inject(Functions);
      const resolveCustomerCallable = httpsCallable<
        void,
        ResolveCustomerResult
      >(functions, 'resolveCustomer');
      const checkoutCallable = httpsCallable<
        CreateCheckoutPayload,
        CheckoutSessionResult
      >(functions, 'createCheckoutSession');
      const verifyCallable = httpsCallable<
        VerifyPaymentPayload,
        VerifyPaymentResult
      >(functions, 'verifyTransaction');
      const cancelCallable = httpsCallable<void, { success: boolean }>(
        functions,
        'cancelSubscription'
      );
      const subscribeCallable = httpsCallable<
        CreateSubscriptionPayload,
        CreateSubscriptionResult
      >(functions, 'createSubscription');

      return {
        /**
         * Creates an ONVO Payment Method by calling POST /v1/payment-methods
         * directly from Angular using the publishableKey.
         *
         * Prerequisites: prepareCheckout() must have succeeded so that
         * customerId and publishableKey are present in the store.
         *
         * Security:
         *  - Uses publishableKey (client-safe by ONVO contract) as Bearer token.
         *  - customerId is read from store state — never from component input.
         *  - The Firebase backend never receives raw card data (PCI boundary).
         *  - On success, only the opaque paymentMethodId is stored in state.
         *
         * On success: paymentMethodId is stored in state and cardSuccess = true.
         * On error: cardError is set with a user-facing message.
         *
         * ONVO endpoint: POST /v1/payment-methods
         * ONVO OpenAPI: CreatePaymentMethodRequest + PaymentMethod response schema.
         */
        createPaymentMethod: rxMethod<OnvoCardInput>(
          pipe(
            tap(() => {
              store.cardSetLoading();
              patchState(store, { paymentMethodId: null });
            }),
            switchMap((cardInput) => {
              const customerId = store.customerId();
              const publishableKey = store.publishableKey();

              if (!customerId || !publishableKey) {
                return throwError(
                  () =>
                    new Error(
                      'customerId and publishableKey are required. Call prepareCheckout() first.'
                    )
                );
              }

              const fetchPm = fetch(`${ONVO_API_BASE}/v1/payment-methods`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${publishableKey}`,
                },
                body: JSON.stringify({
                  type: 'card',
                  card: {
                    number: cardInput.number,
                    expMonth: cardInput.expMonth,
                    expYear: cardInput.expYear,
                    cvv: cardInput.cvc,
                    holderName: cardInput.holderName,
                  },
                  customerId,
                }),
              }).then(async (response): Promise<OnvoPaymentMethodResponse> => {
                if (!response.ok) {
                  const body = await response.text();
                  throw new Error(
                    `ONVO POST /v1/payment-methods failed: HTTP ${response.status} — ${body}`
                  );
                }
                return response.json() as Promise<OnvoPaymentMethodResponse>;
              });

              return from(fetchPm).pipe(
                tapResponse({
                  next: (pm) => {
                    patchState(store, { paymentMethodId: pm.id });
                    store.cardSetSuccess();
                    // TODO(dev): remove before production
                    console.debug(
                      '[billing:dev] createPaymentMethod resolved',
                      {
                        paymentMethodId: pm.id,
                        brand: pm.card.brand,
                        last4: pm.card.last4,
                      }
                    );
                  },
                  error: (err: unknown) => {
                    console.error('[billing] createPaymentMethod error', err);
                    store.cardSetError(
                      'No se pudo registrar el método de pago. Verifica los datos de tu tarjeta.'
                    );
                  },
                })
              );
            })
          )
        ),

        /**
         * Calls the `resolveCustomer` Firebase Callable Function.
         * Resolves (or provisions) the ONVO customerId for the authenticated user
         * and stores the publishableKey needed for Payment Method creation.
         * Must be called before launching the ONVO SDK or creating a Payment Method.
         */
        prepareCheckout: rxMethod<void>(
          pipe(
            tap(() => {
              store.prepareSetLoading();
              patchState(store, {
                customerId: null,
                publishableKey: null,
                paymentMethodId: null,
              });
            }),
            switchMap(() => {
              return from(resolveCustomerCallable()).pipe(
                tapResponse({
                  next: ({ data }) => {
                    patchState(store, {
                      customerId: data.customerId,
                      publishableKey: data.publishableKey,
                    });
                    store.prepareSetSuccess();
                    // TODO(dev): remove before production
                    console.debug('[billing:dev] prepareCheckout resolved', {
                      customerId: data.customerId,
                      publishableKey: data.publishableKey,
                    });
                  },
                  error: (err: unknown) => {
                    console.error('[billing] prepareCheckout error', err);
                    store.prepareSetError(
                      'No se pudo preparar el proceso de pago. Inténtalo de nuevo.'
                    );
                  },
                })
              );
            })
          )
        ),

        /**
         * Calls the `createCheckoutSession` Firebase Callable Function.
         * On success, stores `checkoutUrl` and `checkoutSessionId`.
         * The caller is responsible for redirecting to `checkoutUrl`.
         */
        createCheckout: rxMethod<SubscriptionPlan>(
          pipe(
            tap(() => {
              store.checkoutSetLoading();
              patchState(store, { checkoutUrl: null, checkoutSessionId: null });
            }),
            switchMap((plan) => {
              return from(checkoutCallable({ plan })).pipe(
                tapResponse({
                  next: ({ data }) => {
                    patchState(store, {
                      checkoutUrl: data.checkoutUrl,
                      checkoutSessionId: data.sessionId,
                    });
                    store.checkoutSetSuccess();
                  },
                  error: (err: unknown) => {
                    console.error('[billing] createCheckout error', err);
                    store.checkoutSetError(
                      'No se pudo iniciar el proceso de pago. Inténtalo de nuevo.'
                    );
                  },
                })
              );
            })
          )
        ),

        /**
         * Calls the `verifyTransaction` Firebase Callable Function.
         * Sets `pendingVerification` while waiting — the subscription state
         * will update automatically via Firestore onSnapshot when the webhook
         * processes the payment.
         *
         * NOTE: This does NOT activate premium. It only queries the current
         * transaction status. The webhook is the single source of activation.
         */
        verifyPayment: rxMethod<string>(
          pipe(
            tap(() => {
              store.verifySetLoading();
            }),
            switchMap((sessionId) => {
              return from(verifyCallable({ sessionId })).pipe(
                tapResponse({
                  next: () => {
                    store.verifySetSuccess();
                  },
                  error: (err: unknown) => {
                    console.error('[billing] verifyPayment error', err);
                    store.verifySetError(
                      'No se pudo verificar el pago. Espera unos momentos e intenta de nuevo.'
                    );
                  },
                })
              );
            })
          )
        ),

        /**
         * Calls the `cancelSubscription` Firebase Callable Function.
         * The store's subscription state updates automatically via onSnapshot
         * once Firestore reflects the cancellation.
         */
        cancelSubscription: rxMethod<void>(
          pipe(
            tap(() => store.cancelSetLoading()),
            switchMap(() => {
              return from(cancelCallable()).pipe(
                tapResponse({
                  next: () => store.cancelSetSuccess(),
                  error: (err: unknown) => {
                    console.error('[billing] cancelSubscription error', err);
                    store.cancelSetError(
                      'No se pudo cancelar la suscripción. Inténtalo de nuevo.'
                    );
                  },
                })
              );
            })
          )
        ),

        /** Clears the checkout URL and session after navigation. */
        clearCheckout(): void {
          patchState(store, {
            checkoutUrl: null,
            checkoutSessionId: null,
          });
          store.checkoutResetState();
        },

        /**
         * Calls the `createSubscription` Firebase Callable Function.
         *
         * Reads `paymentMethodId` from store state — never accepts it from
         * component input — to preserve the security invariant established by
         * CRIT-1: the backend is the only party that owns the customerId, and
         * the paymentMethodId origin is the ONVO API call made in this same store.
         *
         * ACTIVATION CHAIN (this function does NOT activate premium):
         *
         *   subscribeCheckout()
         *       ↓
         *   createSubscription callable (Firebase Function)
         *       ↓
         *   ONVO Loop — processes first payment
         *       ↓
         *   Webhook — handleOnvoWebhook (payment-intent.succeeded)
         *       ↓
         *   Firestore — users/{uid}.subscription.status = 'active'
         *       ↓
         *   onSnapshot listener — withSubscriptionFeature
         *       ↓
         *   store.isPremium() → true
         *
         * This function only places the subscription request. Premium reflects
         * automatically once Firestore updates via the onSnapshot listener.
         *
         * Prerequisites: createPaymentMethod() must have succeeded so that
         * paymentMethodId is non-null in the store.
         */
        subscribeCheckout: rxMethod<void>(
          pipe(
            tap(() => store.subscribeSetLoading()),
            switchMap(() => {
              const paymentMethodId = store.paymentMethodId();

              if (!paymentMethodId) {
                return throwError(
                  () =>
                    new Error(
                      'paymentMethodId is required. Call createPaymentMethod() first.'
                    )
                );
              }

              return from(subscribeCallable({ paymentMethodId })).pipe(
                tapResponse({
                  next: ({ data }) => {
                    store.subscribeSetSuccess();
                    // TODO(dev): remove before production
                    console.debug('[billing:dev] subscribeCheckout resolved', {
                      subscriptionId: data.subscriptionId,
                      status: data.status,
                    });
                  },
                  error: (err: unknown) => {
                    console.error('[billing] subscribeCheckout error', err);
                    store.subscribeSetError(
                      'No se pudo completar la suscripción. Verifica tu método de pago e inténtalo de nuevo.'
                    );
                  },
                })
              );
            })
          )
        ),
      };
    })
  );
}
