import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret, defineString } from 'firebase-functions/params';
import * as admin from 'firebase-admin';

// ─── Secrets & Config ─────────────────────────────────────────────────────────
const onvoSecretKey = defineSecret('ONVO_SECRET_KEY');
const onvoApiUrl = defineString('ONVO_API_URL', {
  default: 'https://api.onvopay.com',
});

/**
 * cancelSubscription
 *
 * Firebase Callable Function that cancels a recurring ONVO Loop subscription
 * at the end of the current billing period.
 *
 * ONVO endpoint (confirmed from official OpenAPI spec):
 *   DELETE /v1/subscriptions/{id}
 *   Returns 200 with the updated Subscription object on success.
 *
 * Behaviour after cancellation:
 *  - The subscription remains active until `currentPeriodEnd`.
 *  - ONVO sets `cancelAtPeriodEnd: true` on the subscription object.
 *  - No further renewals are attempted after the current period ends.
 *  - This function mirrors that by writing `cancelAtPeriodEnd: true` to
 *    Firestore ONLY after ONVO confirms the cancellation.
 *
 * Security:
 *  - Requires authenticated user (request.auth).
 *  - Validates that the subscriptionId belongs to the caller before calling ONVO.
 *
 * Secrets: ONVO_SECRET_KEY
 * Config:  ONVO_API_URL
 */
export const cancelSubscription = onCall(
  { secrets: [onvoSecretKey] },
  async (request) => {
    // ── Auth guard ─────────────────────────────────────────────────────────────
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.'
      );
    }

    const uid = request.auth.uid;
    const { subscriptionId } = request.data as { subscriptionId: string };

    if (!subscriptionId || typeof subscriptionId !== 'string') {
      throw new HttpsError('invalid-argument', 'subscriptionId is required.');
    }

    // ── Ownership validation ───────────────────────────────────────────────────
    await assertSubscriptionOwnership(uid, subscriptionId);

    // ── Cancel in ONVO ─────────────────────────────────────────────────────────
    await cancelOnvoSubscription(
      subscriptionId,
      onvoSecretKey.value(),
      onvoApiUrl.value()
    );

    // ── Update Firestore — only after ONVO confirms success ───────────────────
    await admin
      .firestore()
      .collection('users')
      .doc(uid)
      .set(
        {
          subscription: {
            cancelAtPeriodEnd: true,
            // P6: record when the cancellation was requested for audit/support.
            // Different from the moment access actually ends (currentPeriodEnd).
            canceledAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
        },
        { merge: true }
      );

    console.info(
      `[billing] cancelSubscription: uid=${uid}, subscriptionId=${subscriptionId}`
    );

    return { success: true };
  }
);

// ─── Ownership validation ─────────────────────────────────────────────────────

async function assertSubscriptionOwnership(
  uid: string,
  subscriptionId: string
): Promise<void> {
  const userSnap = await admin.firestore().collection('users').doc(uid).get();
  const stored = userSnap.data()?.['subscription']?.['onvoSubscriptionId'] as
    | string
    | undefined;

  if (!stored || stored !== subscriptionId) {
    console.warn(
      `[billing] cancelSubscription: ownership check failed uid=${uid}, requested=${subscriptionId}, stored=${stored}`
    );
    throw new HttpsError(
      'permission-denied',
      'Subscription does not belong to this user.'
    );
  }
}

// ─── ONVO API call ────────────────────────────────────────────────────────────

/**
 * Cancels the ONVO subscription by calling DELETE /v1/subscriptions/{id}.
 *
 * Confirmed endpoint from ONVO OpenAPI spec (openapi.yaml):
 *   delete:
 *     tags: [Cargos recurrentes]
 *     summary: Cancelar un Cargo recurrente
 *     security: [SecretApiKey]
 *     parameters: [{ name: id, in: path, required: true }]
 *     responses:
 *       "200": { schema: $ref: Subscription }
 */
async function cancelOnvoSubscription(
  subscriptionId: string,
  apiKey: string,
  apiBase: string
): Promise<void> {
  const response = await fetch(
    `${apiBase}/v1/subscriptions/${subscriptionId}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${apiKey}` },
    }
  );

  if (!response.ok) {
    console.error(
      `[billing] ONVO DELETE /v1/subscriptions/${subscriptionId} failed: HTTP ${response.status}`
    );
    throw new HttpsError('internal', 'Could not cancel subscription.');
  }
}
