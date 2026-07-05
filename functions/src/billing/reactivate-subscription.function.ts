import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret, defineString } from 'firebase-functions/params';
import * as admin from 'firebase-admin';

// ─── Secrets & Config ─────────────────────────────────────────────────────────
const onvoSecretKey = defineSecret('ONVO_SECRET_KEY');
const onvoApiUrl = defineString('ONVO_API_URL', {
  default: 'https://api.onvopay.com',
});

/**
 * reactivateSubscription
 *
 * Firebase Callable Function that undoes a scheduled end-of-period cancellation,
 * restoring automatic renewals for an active subscription.
 *
 * Only valid when:
 *  - subscription.status === 'active'
 *  - subscription.cancelAtPeriodEnd === true
 *  - subscription.currentPeriodEnd > now()  (period has not yet elapsed)
 *
 * ONVO endpoint:
 *  PATCH /v1/subscriptions/{id}   body: { cancelAtPeriodEnd: false }
 *
 * On success:
 *  - ONVO resumes automatic renewal.
 *  - Firestore is updated: cancelAtPeriodEnd = false.
 *  - The onSnapshot listener in withSubscriptionFeature picks up the change
 *    and the UI updates automatically — no manual reload required.
 *
 * Security:
 *  - Requires authenticated user (request.auth).
 *  - The subscriptionId is NEVER accepted from the client — it is resolved
 *    from Firestore using the authenticated uid, preventing IDOR attacks.
 *
 * Secrets: ONVO_SECRET_KEY
 * Config:  ONVO_API_URL
 */
export const reactivateSubscription = onCall(
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

    // ── Resolve and validate subscription from Firestore ──────────────────────
    const subscriptionId = await resolveReactivatableSubscriptionId(uid);

    // ── Undo scheduled cancellation in ONVO ───────────────────────────────────
    await reactivateOnvoSubscription(
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
            cancelAtPeriodEnd: false,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
        },
        { merge: true }
      );

    console.info(
      `[billing] reactivateSubscription: uid=${uid}, subscriptionId=${subscriptionId}`
    );

    return { success: true };
  }
);

// ─── Firestore resolution ─────────────────────────────────────────────────────

/**
 * Reads the authenticated user's subscriptionId from Firestore and validates
 * that reactivation is allowed. Throws HttpsError if any precondition fails.
 */
async function resolveReactivatableSubscriptionId(
  uid: string
): Promise<string> {
  const userSnap = await admin.firestore().collection('users').doc(uid).get();
  const sub = userSnap.data()?.['subscription'] as
    | {
        onvoSubscriptionId?: string;
        status?: string;
        cancelAtPeriodEnd?: boolean;
        currentPeriodEnd?: admin.firestore.Timestamp | null;
      }
    | undefined;

  if (!sub?.onvoSubscriptionId) {
    throw new HttpsError(
      'not-found',
      'No subscription found for this account.'
    );
  }

  if (sub.status !== 'active') {
    throw new HttpsError(
      'failed-precondition',
      'Only active subscriptions can be reactivated.'
    );
  }

  if (!sub.cancelAtPeriodEnd) {
    throw new HttpsError(
      'failed-precondition',
      'Subscription is not scheduled for cancellation.'
    );
  }

  if (sub.currentPeriodEnd) {
    const endDate = sub.currentPeriodEnd.toDate();
    if (endDate.getTime() <= Date.now()) {
      throw new HttpsError(
        'failed-precondition',
        'Subscription period has already ended and cannot be reactivated.'
      );
    }
  }

  return sub.onvoSubscriptionId;
}

// ─── ONVO API call ────────────────────────────────────────────────────────────

/**
 * Calls ONVO to undo the scheduled end-of-period cancellation.
 *
 * ONVO endpoint: PATCH /v1/subscriptions/{id}
 * Body: { cancelAtPeriodEnd: false }
 *
 * This is the standard REST pattern for reverting a cancel_at_period_end
 * flag on a subscription. If ONVO publishes a dedicated resume endpoint
 * in a future API version, update this call accordingly.
 */
async function reactivateOnvoSubscription(
  subscriptionId: string,
  apiKey: string,
  apiBase: string
): Promise<void> {
  const response = await fetch(
    `${apiBase}/v1/subscriptions/${subscriptionId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ cancelAtPeriodEnd: false }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(
      `[billing] ONVO PATCH /v1/subscriptions/${subscriptionId} failed: HTTP ${response.status}`,
      errorBody
    );
    throw new HttpsError('internal', 'Could not reactivate subscription.');
  }
}
