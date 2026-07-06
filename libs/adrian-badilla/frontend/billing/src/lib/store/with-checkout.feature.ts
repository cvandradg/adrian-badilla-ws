import {
  patchState,
  signalStoreFeature,
  withComputed,
  withMethods,
  withState,
  WritableStateSource,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap, from, of, map } from 'rxjs';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { computed, inject } from '@angular/core';
import type {
  CheckoutPhase,
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
  /** Consolidated error from startPaymentFlow (customer resolution, PM creation, subscribe). */
  checkoutError: string | null;
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
    withCallState('checkout'),
    withCallState('verify'),
    withCallState('cancel'),

    withState<CheckoutState>({
      checkoutUrl: null,
      checkoutSessionId: null,
      customerId: null,
      publishableKey: null,
      paymentMethodId: null,
      checkoutError: null,
    }),

    withComputed((store) => ({
      /**
       * True when resolveCustomer has returned a customerId.
       * startPaymentFlow resolves the customer lazily, so this reflects the
       * cached result after the first successful payment flow.
       */
      hasCustomerId: computed(() => store.customerId() !== null),

      /**
       * True when resolveCustomer has returned a publishableKey.
       */
      hasPublishableKey: computed(() => store.publishableKey() !== null),
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
         * Unified payment flow: resolves customer (lazy), creates ONVO Payment
         * Method, and calls createSubscription — all in a single atomic action.
         *
         * Security invariants preserved:
         *  - Card data is sent ONLY to ONVO via publishableKey (client-safe).
         *  - Firebase backend NEVER receives raw card data (PCI boundary).
         *  - customerId is resolved server-side by resolveCustomer callable.
         *  - subscriptionId, status — all written to Firestore by the backend.
         *
         * State transitions:
         *   1. Sets checkoutPhase → 'processing' immediately (UI shows spinner).
         *   2. If customerId is not yet cached: calls resolveCustomer callable.
         *   3. Creates ONVO Payment Method (POST /v1/payment-methods).
         *   4. Calls createSubscription callable with paymentMethodId.
         *   5a. On callable success: stays 'processing'. Firestore webhook will
         *       deliver the definitive result; onSubscriptionNext resets phase.
         *   5b. On any error: sets checkoutPhase → 'filling', stores checkoutError.
         */
        startPaymentFlow: rxMethod<OnvoCardInput>(
          pipe(
            tap(() => {
              patchState(
                store as unknown as WritableStateSource<{
                  checkoutPhase: CheckoutPhase;
                }>,
                { checkoutPhase: 'processing' }
              );
              patchState(store, { checkoutError: null, paymentMethodId: null });
            }),
            switchMap((cardInput) => {
              // Step 1: Resolve ONVO customer — skip if already cached from a
              // prior session (avoids a redundant Firebase callable round-trip).
              const customer$ = store.customerId()
                ? of({
                    customerId: store.customerId()!,
                    publishableKey: store.publishableKey()!,
                  })
                : from(resolveCustomerCallable()).pipe(
                    map(({ data }) => ({
                      customerId: data.customerId,
                      publishableKey: data.publishableKey,
                    })),
                    tap(({ customerId, publishableKey }) =>
                      patchState(store, { customerId, publishableKey })
                    )
                  );

              return customer$.pipe(
                switchMap(({ customerId, publishableKey }) =>
                  // Step 2: Create ONVO Payment Method (client-side, publishableKey only).
                  from(
                    fetch(`${ONVO_API_BASE}/v1/payment-methods`, {
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
                    }).then(async (res): Promise<OnvoPaymentMethodResponse> => {
                      if (!res.ok) {
                        const body = await res.text();
                        throw new Error(
                          `ONVO /v1/payment-methods: HTTP ${res.status} — ${body}`
                        );
                      }
                      return res.json() as Promise<OnvoPaymentMethodResponse>;
                    })
                  ).pipe(
                    tap((pm) => patchState(store, { paymentMethodId: pm.id })),
                    // Step 3: Subscribe via Firebase callable.
                    switchMap((pm) =>
                      from(subscribeCallable({ paymentMethodId: pm.id }))
                    )
                  )
                ),
                tapResponse({
                  next: ({ data }) => {
                    // Callable returned — checkoutPhase stays 'processing'.
                    // onSubscriptionNext resets it to 'idle' once the ONVO webhook
                    // fires and Firestore delivers a definitive status ('active' or 'failed').
                    console.debug('[billing:dev] startPaymentFlow resolved', {
                      subscriptionId: data.subscriptionId,
                      status: data.status,
                    });
                  },
                  error: (err: unknown) => {
                    console.error('[billing] startPaymentFlow error', err);
                    patchState(
                      store as unknown as WritableStateSource<{
                        checkoutPhase: CheckoutPhase;
                      }>,
                      { checkoutPhase: 'filling' }
                    );
                    patchState(store, {
                      checkoutError:
                        'No se pudo procesar el pago. Verifica los datos de tu tarjeta e inténtalo de nuevo.',
                    });
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
         * Resets checkout state so the user can submit a new card after a failure.
         *
         * Sets checkoutPhase → 'filling' (paymentFlowState → 'form') and clears
         * the previous error and paymentMethodId. Does not clear customerId or
         * publishableKey — they remain valid for the next startPaymentFlow call.
         *
         * checkoutPhase lives in withSubscriptionFeature state; the cast through
         * WritableStateSource is required here but is safe at runtime since
         * withSubscriptionFeature is composed before withCheckoutFeature.
         */
        retryPayment(): void {
          patchState(
            store as unknown as WritableStateSource<{
              checkoutPhase: CheckoutPhase;
            }>,
            { checkoutPhase: 'filling' }
          );
          patchState(store, { paymentMethodId: null, checkoutError: null });
        },
      };
    })
  );
}
