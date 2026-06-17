import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret, defineString } from 'firebase-functions/params';
import * as admin from 'firebase-admin';

// ─── Secrets & Config ─────────────────────────────────────────────────────────
const onvoSecretKey = defineSecret('ONVO_SECRET_KEY');
const onvoApiUrl = defineString('ONVO_API_URL', {
  default: 'https://api.onvopay.com',
});

/**
 * getSubscriptionStatus
 *
 * Firebase Callable Function that queries ONVO for the current state of a
 * recurring subscription and returns a sanitised snapshot to the Angular client.
 *
 * Used by the Angular client to poll for status updates after a subscription is
 * created while waiting for the webhook to arrive (e.g. after a delay or a
 * network issue on ONVO's side).
 *
 * Security:
 *  - Requires authenticated user (request.auth).
 *  - Validates that the requested subscriptionId belongs to the caller by
 *    comparing against `subscription.onvoSubscriptionId` stored in Firestore.
 *    Prevents users from querying other users' subscriptions.
 *
 * Secrets: ONVO_SECRET_KEY
 * Config:  ONVO_API_URL
 */
export const getSubscriptionStatus = onCall(
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
    // Returns the current Firestore snapshot for subsequent divergence check.
    const firestoreSub = await assertSubscriptionOwnership(uid, subscriptionId);

    // ── Query ONVO ─────────────────────────────────────────────────────────────
    const sub = await fetchOnvoSubscription(
      subscriptionId,
      onvoSecretKey.value(),
      onvoApiUrl.value()
    );

    // ── P9: Sync Firestore when ONVO is ahead ──────────────────────────────────
    // Handles the case where the webhook was missed and Firestore still shows
    // 'incomplete' while ONVO already processed the first payment ('active').
    //
    // Safety constraint: only sync in the "upgrade" direction (incomplete →
    // active). We do NOT downgrade an already-active subscription based on
    // a ONVO response — that would be handled by the webhook or the daily cron.
    // This prevents inadvertently revoking access due to a transient ONVO API
    // state or a response ordering issue.
    if (sub.status === 'active' && firestoreSub.status !== 'active') {
      const periodStartTs = sub.currentPeriodStart
        ? admin.firestore.Timestamp.fromDate(new Date(sub.currentPeriodStart))
        : null;
      const periodEndTs = sub.currentPeriodEnd
        ? admin.firestore.Timestamp.fromDate(new Date(sub.currentPeriodEnd))
        : null;

      await admin
        .firestore()
        .collection('users')
        .doc(uid)
        .set(
          {
            subscription: {
              status: 'active',
              cancelAtPeriodEnd: sub.cancelAtPeriodEnd ?? false,
              ...(periodStartTs && { currentPeriodStart: periodStartTs }),
              ...(periodEndTs && { currentPeriodEnd: periodEndTs }),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
          },
          { merge: true }
        );

      console.info(
        `[billing] getSubscriptionStatus: synced Firestore for uid=${uid} (was ${firestoreSub.status} → active)`
      );
    }

    console.info(
      `[billing] getSubscriptionStatus: uid=${uid}, subscriptionId=${subscriptionId}, status=${sub.status}`
    );

    return {
      status: sub.status,
      currentPeriodStart: sub.currentPeriodStart ?? null,
      currentPeriodEnd: sub.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd ?? false,
    };
  }
);

// ─── Ownership validation ─────────────────────────────────────────────────────

interface FirestoreSubscriptionSnapshot {
  onvoSubscriptionId?: string;
  status?: string;
}

/**
 * Validates that the requested subscriptionId belongs to the authenticated user
 * and returns the current Firestore subscription snapshot for comparison.
 */
async function assertSubscriptionOwnership(
  uid: string,
  subscriptionId: string
): Promise<FirestoreSubscriptionSnapshot> {
  const userSnap = await admin.firestore().collection('users').doc(uid).get();
  const sub = (userSnap.data()?.['subscription'] ??
    {}) as FirestoreSubscriptionSnapshot;
  const stored = sub.onvoSubscriptionId;

  if (!stored || stored !== subscriptionId) {
    console.warn(
      `[billing] getSubscriptionStatus: ownership check failed uid=${uid}, requested=${subscriptionId}, stored=${stored}`
    );
    throw new HttpsError(
      'permission-denied',
      'Subscription does not belong to this user.'
    );
  }

  return sub;
}

// ─── ONVO API call ────────────────────────────────────────────────────────────

interface OnvoSubscriptionStatusResponse {
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

async function fetchOnvoSubscription(
  subscriptionId: string,
  apiKey: string,
  apiBase: string
): Promise<OnvoSubscriptionStatusResponse> {
  const response = await fetch(
    `${apiBase}/v1/subscriptions/${subscriptionId}`,
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );

  if (!response.ok) {
    console.error(
      `[billing] ONVO GET /v1/subscriptions/${subscriptionId} failed: HTTP ${response.status}`
    );
    throw new HttpsError('internal', 'Could not retrieve subscription status.');
  }

  const body = (await response.json()) as {
    status?: string;
    currentPeriodStart?: string | null;
    currentPeriodEnd?: string | null;
    cancelAtPeriodEnd?: boolean;
  };

  return {
    status: body.status ?? 'unknown',
    currentPeriodStart: body.currentPeriodStart ?? null,
    currentPeriodEnd: body.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: body.cancelAtPeriodEnd ?? false,
  };
}
