import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret, defineString } from 'firebase-functions/params';
import * as admin from 'firebase-admin';

// ─── Secrets & Config (I-3: migrated from deprecated functions.config()) ──────
const onvoSecretKey = defineSecret('ONVO_SECRET_KEY');
const onvoApiUrl = defineString('ONVO_API_URL', {
  default: 'https://api.onvopay.com',
});
const appUrl = defineString('APP_URL', { default: 'https://yourapp.com' });

/**
 * @deprecated LEGACY — DO NOT USE FOR NEW DEVELOPMENT
 *
 * createCheckoutSession
 *
 * Original redirect-based ONVO Pay checkout session flow.
 * STILL REFERENCED by: libs/.../store/with-checkout.feature.ts
 *
 * Status: kept deployed for rollback safety only.
 * Known bugs:
 *  - Wrong endpoint: ONVO has no /v1/checkout/sessions API
 *  - Payload fields (customer_reference, success_url, cancel_url) are
 *    not part of the ONVO OpenAPI spec — invented during original dev
 *
 * Replacement: createSubscription + ONVO Loop recurring subscriptions
 * Remove when: with-checkout.feature.ts is migrated and removed from Angular
 *
 * Secrets: ONVO_SECRET_KEY
 * Config:  ONVO_API_URL, APP_URL
 */
export const createCheckoutSession = onCall(
  { secrets: [onvoSecretKey], cors: true, invoker: 'public' },
  async (request) => {
    // ── Auth guard ────────────────────────────────────────────────────────────
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.'
      );
    }

    const uid = request.auth.uid;
    const { plan } = request.data as { plan: 'free' | 'premium' };

    if (!plan || !['free', 'premium'].includes(plan)) {
      throw new HttpsError('invalid-argument', 'Invalid plan specified.');
    }

    const apiKey = onvoSecretKey.value();
    const apiBase = onvoApiUrl.value();
    const baseUrl = appUrl.value();

    // ── Prevent duplicate active subscriptions ─────────────────────────────
    const userRef = admin.firestore().collection('users').doc(uid);
    const userSnap = await userRef.get();
    const existingSub = userSnap.data()?.['subscription'];
    if (existingSub?.status === 'active' && existingSub?.plan === plan) {
      throw new HttpsError(
        'already-exists',
        'User already has an active subscription for this plan.'
      );
    }

    // ── Create ONVO checkout session ──────────────────────────────────────────
    // Adjust payload to match ONVO's real API contract once docs are available.
    const response = await fetch(`${apiBase}/v1/checkout/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        customer_reference: uid,
        plan,
        success_url: `${baseUrl}/billing/return?status=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/billing/return?status=cancel`,
        metadata: { uid, plan },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[billing] ONVO createCheckout failed', errorBody);
      throw new HttpsError('internal', 'Could not create checkout session.');
    }

    const session = await response.json();

    // ── I-5: Store sessionId for ownership validation in verifyTransaction ────
    await userRef.set(
      { checkoutSessionId: session.id as string },
      { merge: true }
    );

    return {
      checkoutUrl: session.url as string,
      sessionId: session.id as string,
    };
  }
);
