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
 *  - The subscriptionId is NEVER accepted from the client — it is resolved
 *    from Firestore using the authenticated uid, preventing IDOR attacks.
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
    console.info(`[cancelSubscription] start uid=${uid}`);

    // ── Resolve subscription from Firestore (never from client input) ──────────
    // Security: the client cannot supply a different user's subscriptionId.
    const { subscriptionId, alreadyCancelled } =
      await resolveActiveSubscriptionId(uid);

    // ── Idempotency guard ─────────────────────────────────────────────────────
    // If cancelAtPeriodEnd is already true, ONVO was already notified in a prior
    // invocation (double-click, network retry). Return success immediately without
    // calling ONVO again — a second DELETE would fail with a non-200 response.
    if (alreadyCancelled) {
      console.info(
        `[cancelSubscription] already cancelled uid=${uid} subscriptionId=${subscriptionId} — returning success`
      );
      return { success: true };
    }

    console.info(
      `[cancelSubscription] subscriptionId resolved uid=${uid} subscriptionId=${subscriptionId}`
    );

    // ── Cancel in ONVO ─────────────────────────────────────────────────────────
    console.info(
      `[cancelSubscription] calling ONVO DELETE /v1/subscriptions/${subscriptionId}`
    );
    await cancelOnvoSubscription(
      subscriptionId,
      onvoSecretKey.value(),
      onvoApiUrl.value()
    );
    console.info(
      `[cancelSubscription] ONVO confirmed cancellation subscriptionId=${subscriptionId}`
    );

    // ── Update Firestore — only after ONVO confirms success ───────────────────
    console.info(
      `[cancelSubscription] updating Firestore cancelAtPeriodEnd=true uid=${uid}`
    );
    try {
      await admin
        .firestore()
        .collection('users')
        .doc(uid)
        .set(
          {
            subscription: {
              cancelAtPeriodEnd: true,
              // Records when the cancellation was requested for audit/support.
              // Different from the moment access actually ends (currentPeriodEnd).
              canceledAt: admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
          },
          { merge: true }
        );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(
        `[cancelSubscription] Firestore update failed uid=${uid} error="${msg}"`
      );
      throw new HttpsError(
        'internal',
        `Failed to persist cancellation for uid=${uid}: ${msg}`
      );
    }

    console.info(
      `[cancelSubscription] success uid=${uid} subscriptionId=${subscriptionId}`
    );

    return { success: true };
  }
);

// ─── Firestore resolution ─────────────────────────────────────────────────────

/**
 * Reads the authenticated user's subscriptionId from Firestore.
 * Throws HttpsError if no active subscription is found.
 * The subscriptionId is NEVER accepted from the calling client.
 */
interface ResolvedSubscription {
  subscriptionId: string;
  /** True when cancelAtPeriodEnd is already set — caller should skip ONVO DELETE. */
  alreadyCancelled: boolean;
}

async function resolveActiveSubscriptionId(
  uid: string
): Promise<ResolvedSubscription> {
  console.info(`[cancelSubscription] reading Firestore users/${uid}`);

  let userSnap: admin.firestore.DocumentSnapshot;
  try {
    userSnap = await admin.firestore().collection('users').doc(uid).get();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(
      `[cancelSubscription] Firestore read failed uid=${uid} error="${msg}"`
    );
    throw new HttpsError(
      'internal',
      `Could not read subscription data for uid=${uid}: ${msg}`
    );
  }

  console.info(
    `[cancelSubscription] Firestore doc found=${userSnap.exists} uid=${uid}`
  );

  const sub = userSnap.data()?.['subscription'] as
    | { onvoSubscriptionId?: string; status?: string; cancelAtPeriodEnd?: boolean }
    | undefined;

  console.info(
    `[cancelSubscription] subscription data uid=${uid} ` +
      `onvoSubscriptionId=${sub?.onvoSubscriptionId ?? 'undefined'} ` +
      `status=${sub?.status ?? 'undefined'} ` +
      `cancelAtPeriodEnd=${sub?.cancelAtPeriodEnd ?? 'undefined'}`
  );

  if (!sub?.onvoSubscriptionId) {
    throw new HttpsError(
      'not-found',
      'No subscription found for this account.'
    );
  }

  if (sub.status !== 'active') {
    throw new HttpsError(
      'failed-precondition',
      `Only active subscriptions can be cancelled. Current status: ${sub.status}`
    );
  }

  return {
    subscriptionId: sub.onvoSubscriptionId,
    alreadyCancelled: sub.cancelAtPeriodEnd === true,
  };
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
  const url = `${apiBase}/v1/subscriptions/${subscriptionId}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${apiKey}` },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(
      `[cancelSubscription] fetch failed subscriptionId=${subscriptionId} error="${msg}"`
    );
    throw new HttpsError(
      'internal',
      `Network error while contacting payment provider: ${msg}`
    );
  }

  if (!response.ok) {
    let body = '<unreadable>';
    try {
      body = await response.text();
    } catch {
      // ignore — best-effort
    }
    console.error(
      `[cancelSubscription] ONVO DELETE failed subscriptionId=${subscriptionId} ` +
        `status=${response.status} body=${body}`
    );
    throw new HttpsError(
      'internal',
      `Payment provider rejected cancellation (HTTP ${response.status}): ${body}`
    );
  }
}
