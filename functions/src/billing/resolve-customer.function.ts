import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret, defineString } from 'firebase-functions/params';
import * as admin from 'firebase-admin';
import { getOrCreateOnvoCustomer } from './billing.helpers';

// ─── Secrets & Config ─────────────────────────────────────────────────────────
const onvoSecretKey = defineSecret('ONVO_SECRET_KEY');
const onvoPublishableKey = defineSecret('ONVO_PUBLISHABLE_KEY');
const onvoApiUrl = defineString('ONVO_API_URL', {
  default: 'https://api.onvopay.com',
});

// ─── Return type ──────────────────────────────────────────────────────────────

interface ResolveCustomerResult {
  customerId: string;
  publishableKey: string;
}

/**
 * resolveCustomer
 *
 * Firebase Callable Function that resolves (or provisions) the canonical ONVO
 * customer ID for the authenticated user and returns it alongside the
 * publishable key.
 *
 * Angular must call this function BEFORE creating a Payment Method via
 * POST /v1/payment-methods, because:
 *  - ONVO requires the Payment Method's customerId to match the customerId
 *    used when creating the subscription.
 *  - The customerId is owned by the backend (CRIT-1 fix) and is never accepted
 *    from the client.
 *  - The Publishable Key is safe to expose to the client but must not be
 *    hardcoded in Angular source — it is injected from Firebase Secrets here.
 *
 * Typical Angular call sequence:
 *  1. Angular calls resolveCustomer() → receives { customerId, publishableKey }
 *  2. Angular calls POST /v1/payment-methods with publishableKey + customerId
 *     → receives paymentMethodId
 *  3. Angular calls createSubscription({ paymentMethodId })
 *     → backend verifies PM belongs to correct customer, creates subscription
 *
 * Idempotent: if the user already has an onvoCustomerId in Firestore, it is
 * returned immediately without any ONVO API call.
 *
 * Security:
 *  - Requires authenticated user (request.auth).
 *  - uid is taken from request.auth.uid — never from the client payload.
 *  - customerId resolution delegates to getOrCreateOnvoCustomer, which is the
 *    single source of truth for the uid → customerId mapping (CRIT-1 / OWASP A01).
 *  - ONVO_SECRET_KEY is used only for customer provisioning and never returned
 *    to the client.
 *  - ONVO_PUBLISHABLE_KEY is client-safe by design (ONVO contract), but its
 *    value is managed as a Firebase Secret to avoid hardcoding.
 *
 * Secrets: ONVO_SECRET_KEY, ONVO_PUBLISHABLE_KEY
 * Config:  ONVO_API_URL
 */
export const resolveCustomer = onCall(
  {
    secrets: [onvoSecretKey, onvoPublishableKey],
    cors: true,
    invoker: 'public',
  },
  async (request): Promise<ResolveCustomerResult> => {
    // ── Auth guard ─────────────────────────────────────────────────────────────
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.'
      );
    }

    const uid = request.auth.uid;

    // ── Config guard ───────────────────────────────────────────────────────────
    const publishableKey = onvoPublishableKey.value();
    if (!publishableKey) {
      console.error('[billing] resolveCustomer: ONVO_PUBLISHABLE_KEY not set');
      throw new HttpsError('internal', 'Server configuration error.');
    }

    const apiKey = onvoSecretKey.value();
    const apiBase = onvoApiUrl.value();

    // ── Resolve or create ONVO customer ───────────────────────────────────────
    // Delegates to the shared helper that enforces the uid → customerId ownership
    // invariant. customerId is never accepted from the client.
    let customerId: string;
    try {
      customerId = await getOrCreateOnvoCustomer(
        uid,
        apiKey,
        apiBase,
        admin.firestore()
      );
    } catch (err) {
      // Re-throw HttpsErrors as-is; wrap unexpected errors.
      if (err instanceof HttpsError) throw err;
      console.error(
        `[billing] resolveCustomer: getOrCreateOnvoCustomer failed for uid=${uid}`,
        err
      );
      throw new HttpsError('internal', 'Could not resolve billing account.');
    }

    console.info(
      `[billing] resolveCustomer: uid=${uid}, customerId=${customerId}`
    );

    return { customerId, publishableKey };
  }
);
