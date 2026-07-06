import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret, defineString } from 'firebase-functions/params';
import * as admin from 'firebase-admin';

// ─── Secrets & Config (I-3: migrated from deprecated functions.config()) ──────
const onvoSecretKey = defineSecret('ONVO_SECRET_KEY');
const onvoApiUrl = defineString('ONVO_API_URL', {
  default: 'https://api.onvopay.com',
});

/**
 * @deprecated LEGACY — DO NOT USE FOR NEW DEVELOPMENT
 *
 * verifyTransaction
 *
 * Original transaction verification for the redirect-based checkout flow.
 * STILL REFERENCED by: libs/.../store/with-checkout.feature.ts
 *
 * Status: kept deployed for rollback safety only.
 * Known bugs:
 *  - Wrong endpoint: ONVO has no /v1/checkout/sessions/{id} API
 *  - session.transaction_id field does not exist in ONVO OpenAPI spec
 *
 * Replacement: getSubscriptionStatus (for ONVO Loop subscriptions)
 * Remove when: with-checkout.feature.ts is migrated and removed from Angular
 *
 * Secrets: ONVO_SECRET_KEY
 * Config:  ONVO_API_URL
 */
export const verifyTransaction = onCall(
  { secrets: [onvoSecretKey] },
  async (request) => {
    // ── Auth guard ────────────────────────────────────────────────────────────
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.'
      );
    }

    const uid = request.auth.uid;
    const { sessionId } = request.data as { sessionId: string };

    if (!sessionId) {
      throw new HttpsError('invalid-argument', 'sessionId is required.');
    }

    // ── I-5: Ownership validation ─────────────────────────────────────────────
    const userSnap = await admin.firestore().collection('users').doc(uid).get();
    const storedSessionId = userSnap.data()?.['checkoutSessionId'];

    if (!storedSessionId || storedSessionId !== sessionId) {
      console.warn(
        `[billing] Ownership check failed: uid=${uid}, sessionId=${sessionId}`
      );
      throw new HttpsError(
        'permission-denied',
        'Session does not belong to this user.'
      );
    }

    // ── Query ONVO ────────────────────────────────────────────────────────────
    // Adjust endpoint to match ONVO's actual API docs.
    const response = await fetch(
      `${onvoApiUrl.value()}/v1/checkout/sessions/${sessionId}`,
      {
        headers: { Authorization: `Bearer ${onvoSecretKey.value()}` },
      }
    );

    if (!response.ok) {
      console.error('[billing] ONVO verifyTransaction failed', sessionId);
      throw new HttpsError('internal', 'Could not verify transaction.');
    }

    const session = await response.json();

    return {
      status: (session.status as string) ?? 'unknown',
      transactionId: (session.transaction_id as string | null) ?? null,
    };
  }
);
