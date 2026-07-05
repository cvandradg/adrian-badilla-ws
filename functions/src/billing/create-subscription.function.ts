import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret, defineString } from 'firebase-functions/params';
import * as admin from 'firebase-admin';
import { getOrCreateOnvoCustomer } from './billing.helpers';

// ─── Secrets & Config ─────────────────────────────────────────────────────────
const onvoSecretKey = defineSecret('ONVO_SECRET_KEY');
const onvoApiUrl = defineString('ONVO_API_URL', {
  default: 'https://api.onvopay.com',
});
const onvoPriceId = defineString('ONVO_PRICE_ID');

/**
 * createSubscription
 *
 * Firebase Callable Function that creates a new ONVO Loop recurring subscription.
 *
 * THIS FUNCTION DOES NOT ACTIVATE PREMIUM.
 * Premium activation happens exclusively via `handleOnvoWebhook` when
 * ONVO fires a `payment-intent.succeeded` event.
 *
 * Flow:
 *  1. Angular collects card data and calls POST /v1/payment-methods directly
 *     with the Publishable Key, receiving a paymentMethodId.
 *  2. Angular passes only paymentMethodId to this callable.
 *  3. This function resolves or creates the ONVO customer server-side,
 *     creates the subscription in ONVO, and records the initial state
 *     (status: 'incomplete') in Firestore.
 *  4. The webhook activates premium once ONVO confirms the first payment.
 *
 * Security:
 *  - Requires authenticated user (request.auth).
 *  - uid is taken from request.auth.uid — never from the client payload.
 *  - customerId is resolved server-side via getOrCreateOnvoCustomer —
 *    never accepted from the client (CRIT-1 / OWASP A01 fix).
 *  - ONVO secret key is a Firebase Secret — never exposed to Angular.
 *  - Guards against duplicate active subscriptions before calling ONVO.
 *
 * Secrets: ONVO_SECRET_KEY
 * Config:  ONVO_API_URL, ONVO_PRICE_ID
 */
export const createSubscription = onCall(
  { secrets: [onvoSecretKey], cors: true, invoker: 'public' },
  async (request) => {
    // ── Auth guard ─────────────────────────────────────────────────────────────
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.'
      );
    }

    const uid = request.auth.uid;
    const input = request.data as CreateSubscriptionInput;

    validateInput(input);

    const { paymentMethodId } = input;
    const apiKey = onvoSecretKey.value();
    const apiBase = onvoApiUrl.value();
    const priceId = onvoPriceId.value();

    if (!priceId) {
      console.error('[billing] createSubscription: ONVO_PRICE_ID not set');
      throw new HttpsError('internal', 'Server configuration error.');
    }

    // ── Resolve or create ONVO customer (CRIT-1 fix) ─────────────────────────
    // customerId is resolved server-side — never accepted from the client.
    // See getOrCreateOnvoCustomer for the ownership enforcement logic.
    const customerId = await getOrCreateOnvoCustomer(
      uid,
      apiKey,
      apiBase,
      admin.firestore()
    );

    // ── Guard + optimistic lock (P5: race condition prevention) ──────────────
    // Uses a Firestore transaction to atomically check for an existing
    // subscription and write a 'pending' status. Because Firestore transactions
    // use optimistic concurrency, two simultaneous requests targeting the same
    // uid will conflict: Firestore retries the second transaction which will
    // then see the 'pending' status written by the first and abort.

    // ── Cancel failed subscription if a prior attempt failed (BUG-FIX) ──────
    // When payment-intent.failed fires, Firestore is left with:
    //   { status: 'incomplete', onvoSubscriptionId: 'sub_xxx', lastPaymentError: {...} }
    // acquireSubscriptionLock treats incomplete+onvoSubscriptionId as a hard block,
    // so without this step any retry gets 'A subscription is already in progress'.
    // We cancel the dead ONVO subscription and clear the stale Firestore fields
    // BEFORE acquiring the lock so the guard sees a clean state.
    await cancelFailedSubscriptionIfNeeded(uid, apiKey, apiBase);

    await acquireSubscriptionLock(uid);
    console.info(`[billing] createSubscription: lock acquired uid=${uid}`);

    // ── Create subscription in ONVO ─────────────────────────────────────────
    // If the ONVO call fails we must clean up the 'pending' lock so the user
    // can retry. The lock is also overwritten by persistSubscriptionState on
    // success, so no explicit cleanup is needed on the happy path.
    let subscription: OnvoSubscriptionResponse;
    try {
      subscription = await createOnvoSubscription({
        customerId,
        paymentMethodId,
        priceId,
        uid,
        apiKey,
        apiBase,
      });
    } catch (err) {
      // ONVO call failed (network / 4xx / 5xx) — no subscription was created.
      // Release the pending lock so the user can retry immediately.
      console.error(
        `[billing] createSubscription: ONVO createSubscription failed uid=${uid}`,
        err
      );
      await releaseSubscriptionLock(uid);
      throw err;
    }

    // ── Persist state in Firestore (two writes, independent) ────────────────
    // BUG-FIX: If the Firestore write fails AFTER ONVO already created the
    // subscription, the next retry would create a duplicate ONVO subscription
    // (the stale lock would eventually expire, and createOnvoSubscription would
    // run again with no knowledge of the orphaned sub_xxx).
    // Fix: cancel the ONVO subscription on persist failure so the state is clean.
    try {
      await persistSubscriptionState({
        uid,
        customerId,
        paymentMethodId,
        subscription,
      });
    } catch (persistErr) {
      console.error(
        `[billing] createSubscription: Firestore persist failed uid=${uid} sub=${subscription.id} — rolling back ONVO subscription`,
        persistErr
      );
      // Best-effort ONVO rollback — cancel the subscription we just created.
      try {
        const rollbackRes = await fetch(
          `${apiBase}/v1/subscriptions/${subscription.id}`,
          { method: 'DELETE', headers: { Authorization: `Bearer ${apiKey}` } }
        );
        console.info(
          `[billing] createSubscription: ONVO rollback ${
            rollbackRes.ok ? 'succeeded' : `failed HTTP ${rollbackRes.status}`
          } sub=${subscription.id}`
        );
      } catch (rollbackErr) {
        console.error(
          `[billing] createSubscription: ONVO rollback threw sub=${subscription.id}`,
          rollbackErr
        );
      }
      // Release the lock so the next attempt can proceed after we retry.
      await releaseSubscriptionLock(uid);
      throw persistErr;
    }

    console.info(
      `[billing] createSubscription: completed uid=${uid} sub=${subscription.id} status=${subscription.status}`
    );

    return {
      success: true,
      subscriptionId: subscription.id,
      status: subscription.status,
    };
  }
);

// ─── Input validation ─────────────────────────────────────────────────────────

/**
 * customerId is intentionally absent from this interface.
 * It is resolved server-side via getOrCreateOnvoCustomer and must never be
 * accepted from the client — doing so was a CRIT-1 / OWASP A01 vulnerability:
 * any authenticated user could supply another user's customerId and poison the
 * customers/{customerId} → uid mapping used by the webhook to activate premium.
 */
interface CreateSubscriptionInput {
  paymentMethodId: string;
}

function validateInput(input: CreateSubscriptionInput): void {
  if (!input?.paymentMethodId || typeof input.paymentMethodId !== 'string') {
    throw new HttpsError('invalid-argument', 'paymentMethodId is required.');
  }
}

// ─── Retry cleanup (BUG-FIX: incomplete + lastPaymentError) ──────────────────

/**
 * Cancels the existing ONVO subscription and clears the stale Firestore fields
 * when a prior subscription attempt's first payment was definitively rejected.
 *
 * The problem:
 *   After payment-intent.failed fires, Firestore holds:
 *     { status: 'incomplete', onvoSubscriptionId: 'sub_xxx', lastPaymentError: {...} }
 *   acquireSubscriptionLock blocks any new attempt because it sees
 *   incomplete + onvoSubscriptionId regardless of lastPaymentError.
 *
 * This function is a pre-step to acquireSubscriptionLock. It acts ONLY when
 * ALL three conditions are true:
 *   1. status === 'incomplete'          — payment never confirmed
 *   2. onvoSubscriptionId is set        — subscription exists in ONVO
 *   3. lastPaymentError is set          — webhook confirmed the failure
 *
 * The ONVO cancellation is best-effort: if ONVO already cleaned up the
 * subscription (expired, auto-voided) the DELETE is a no-op. Regardless of
 * the ONVO response, the Firestore fields are always cleared so the lock can
 * be acquired normally on the next call.
 */
async function cancelFailedSubscriptionIfNeeded(
  uid: string,
  apiKey: string,
  apiBase: string
): Promise<void> {
  const db = admin.firestore();
  const userSnap = await db.collection('users').doc(uid).get();
  const sub = userSnap.data()?.['subscription'] as
    | {
        status?: string;
        onvoSubscriptionId?: string;
        lastPaymentError?: object | null;
      }
    | undefined;

  // Only act when ALL three signals confirm a definitively-failed prior attempt.
  if (
    sub?.status !== 'incomplete' ||
    !sub?.onvoSubscriptionId ||
    !sub?.lastPaymentError
  ) {
    return;
  }

  const staleSubscriptionId = sub.onvoSubscriptionId;

  // Cancel the dead ONVO subscription (best-effort).
  try {
    const response = await fetch(
      `${apiBase}/v1/subscriptions/${staleSubscriptionId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${apiKey}` },
      }
    );
    if (response.ok) {
      console.info(
        `[billing] cancelFailedSubscriptionIfNeeded: cancelled ONVO sub ${staleSubscriptionId} for uid=${uid}`
      );
    } else {
      // Non-2xx from ONVO — subscription may already be gone; proceed anyway.
      console.warn(
        `[billing] cancelFailedSubscriptionIfNeeded: ONVO DELETE returned HTTP ${response.status} for sub ${staleSubscriptionId} — proceeding with Firestore cleanup`
      );
    }
  } catch (err) {
    // Network / timeout error — proceed with Firestore cleanup regardless.
    console.warn(
      `[billing] cancelFailedSubscriptionIfNeeded: ONVO DELETE failed for sub ${staleSubscriptionId}`,
      err
    );
  }

  // FIX-HIGH: Use a transaction for the cleanup write to guard against the
  // narrow race window where payment-intent.succeeded fires between our initial
  // read above and this write (e.g. an ONVO automatic retry collecting payment
  // for the failed subscription while we were cancelling it).
  //
  // If the subscription was activated in that window, the ONVO DELETE we just
  // issued may have cancelled an active subscription. We log a critical alert
  // and abort so the caller (createSubscription) surfaces an error instead of
  // silently leaving the user without premium.
  await db.runTransaction(async (tx) => {
    const currentSnap = await tx.get(db.collection('users').doc(uid));
    const currentStatus = currentSnap.data()?.['subscription']?.['status'] as
      | string
      | undefined;

    if (currentStatus === 'active') {
      console.error(
        '[billing] cancelFailedSubscriptionIfNeeded: RACE CONDITION DETECTED —' +
          ` subscription ${staleSubscriptionId} was activated between the stale-check read` +
          ` and the ONVO DELETE for uid=${uid}.` +
          ' ONVO subscription may need manual restoration via dashboard.'
      );
      // Throw so createSubscription fails visibly rather than silently
      // clearing an active subscription from Firestore.
      throw new HttpsError(
        'aborted',
        'Subscription state conflict. Please contact support.'
      );
    }

    tx.set(
      db.collection('users').doc(uid),
      {
        subscription: {
          status: 'inactive',
          onvoSubscriptionId: admin.firestore.FieldValue.delete(),
          lastPaymentError: admin.firestore.FieldValue.delete(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
      },
      { merge: true }
    );
  });

  console.info(
    `[billing] cancelFailedSubscriptionIfNeeded: cleared stale state uid=${uid} sub=${staleSubscriptionId}`
  );
}

// ─── Subscription lock (race condition guard) ─────────────────────────────────

/**
 * Atomically checks for an existing subscription and writes a 'pending' lock
 * in a single Firestore transaction.
 *
 * Blocks creation when:
 *  - status === 'active'   → already subscribed
 *  - status === 'pending' AND lock is fresh (< LOCK_TTL_MS ago)
 *    → concurrent request is in flight; reject to prevent duplicate subscription
 *  - status === 'pending' AND lock is stale (>= LOCK_TTL_MS ago)
 *    → prior Cloud Function was killed (OOM/timeout); allow retry
 *  - status === 'incomplete' with onvoSubscriptionId set
 *    → prior subscription exists but payment hasn't landed; block until
 *      the user explicitly cancels or the subscription expires
 *
 * Why a transaction? Two simultaneous Cloud Function invocations for the same
 * uid would both pass a plain document read check. The Firestore transaction
 * uses optimistic concurrency: the second request retries after the first
 * commits, sees the 'pending' status, and aborts with 'already-exists'.
 *
 * Stale lock recovery: if the Cloud Function that wrote 'pending' was killed
 * before completing, the lock would be permanent without the TTL check.
 * LOCK_TTL_MS is set to 5 minutes — well above the maximum Cloud Function
 * execution time (default 60s, max 3600s). Adjust if the function timeout is
 * extended beyond this value.
 */

/** Maximum age of a 'pending' lock before it is treated as stale and released. */
const LOCK_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function acquireSubscriptionLock(uid: string): Promise<void> {
  const db = admin.firestore();
  const userRef = db.collection('users').doc(uid);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(userRef);
    const sub = snap.data()?.['subscription'] as
      | {
          status?: string;
          onvoSubscriptionId?: string;
          pendingLockedAt?: admin.firestore.Timestamp;
        }
      | undefined;

    // 'active' → already has a valid subscription.
    if (sub?.status === 'active') {
      throw new HttpsError(
        'already-exists',
        'A subscription is already active for this account.'
      );
    }

    // 'incomplete' + onvoSubscriptionId → subscription exists but unpaid.
    if (sub?.status === 'incomplete' && Boolean(sub?.onvoSubscriptionId)) {
      throw new HttpsError(
        'already-exists',
        'A subscription is already in progress for this account.'
      );
    }

    // 'pending' → check if the lock is fresh or stale.
    if (sub?.status === 'pending') {
      const lockedAt = sub.pendingLockedAt;
      const isStale =
        !lockedAt || Date.now() - lockedAt.toMillis() >= LOCK_TTL_MS;

      if (!isStale) {
        throw new HttpsError(
          'already-exists',
          'A subscription request is already in progress. Please wait a moment and try again.'
        );
      }
      // Stale lock — fall through and overwrite below.
      console.warn(
        `[billing] acquireSubscriptionLock: stale lock detected uid=${uid} lockedAt=${sub?.pendingLockedAt?.toMillis()} — overwriting`
      );
    }

    // Write 'pending' lock with a timestamp for stale-lock detection.
    tx.set(
      userRef,
      {
        subscription: {
          status: 'pending',
          provider: 'onvo',
          pendingLockedAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
      },
      { merge: true }
    );
  });
}

/**
 * Clears the 'pending' lock written by acquireSubscriptionLock.
 * Only called when the ONVO API call fails so the user can retry.
 * On success the lock is naturally overwritten by persistSubscriptionState.
 */
async function releaseSubscriptionLock(uid: string): Promise<void> {
  try {
    // Reset to 'inactive' — not 'incomplete'.
    // 'incomplete' implies a subscription exists in ONVO; here it does not
    // (this path is reached only when createOnvoSubscription failed or
    // persistSubscriptionState failed after an ONVO rollback).
    // Clearing pendingLockedAt avoids a stale-lock window on the next read.
    await admin
      .firestore()
      .collection('users')
      .doc(uid)
      .set(
        {
          subscription: {
            status: 'inactive',
            pendingLockedAt: admin.firestore.FieldValue.delete(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
        },
        { merge: true }
      );
    console.info(`[billing] releaseSubscriptionLock: released uid=${uid}`);
  } catch (releaseErr) {
    // Best-effort: log but don't mask the original error.
    // The pending lock will expire naturally after LOCK_TTL_MS (5 min).
    console.error(
      `[billing] releaseSubscriptionLock: FAILED uid=${uid} — lock will expire after TTL`,
      releaseErr
    );
  }
}

// ─── ONVO API call ────────────────────────────────────────────────────────────

interface OnvoSubscriptionResponse {
  id: string;
  status: string;
  customerId: string;
  paymentMethodId: string;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
}

interface CreateOnvoSubscriptionParams {
  customerId: string;
  paymentMethodId: string;
  priceId: string;
  uid: string;
  apiKey: string;
  apiBase: string;
}

async function createOnvoSubscription(
  params: CreateOnvoSubscriptionParams
): Promise<OnvoSubscriptionResponse> {
  const { customerId, paymentMethodId, priceId, uid, apiKey, apiBase } = params;

  const response = await fetch(`${apiBase}/v1/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      customerId,
      paymentMethodId,
      items: [{ priceId, quantity: 1 }],
      metadata: { uid, plan: 'premium' },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(
      `[billing] ONVO POST /v1/subscriptions failed: HTTP ${response.status}`,
      errorBody
    );
    throw new HttpsError('internal', 'Could not create subscription.');
  }

  return (await response.json()) as OnvoSubscriptionResponse;
}

// ─── Firestore writes ─────────────────────────────────────────────────────────

interface PersistParams {
  uid: string;
  customerId: string;
  paymentMethodId: string;
  subscription: OnvoSubscriptionResponse;
}

async function persistSubscriptionState(params: PersistParams): Promise<void> {
  const { uid, customerId, paymentMethodId, subscription } = params;
  const db = admin.firestore();
  const now = admin.firestore.FieldValue.serverTimestamp();

  // Write both documents concurrently — they are independent.
  await Promise.all([
    // 1. Customer → UID mapping used by the webhook to resolve uid.
    db
      .collection('customers')
      .doc(customerId)
      .set({ uid, createdAt: now }, { merge: true }),

    // 2. Initial subscription state on the user document.
    //    Status stays 'incomplete' — webhook sets it to 'active' after first payment.
    //
    //    P2: ONVO may return currentPeriodStart/currentPeriodEnd even at creation
    //    time (e.g. for trial-based subscriptions or immediate-charge plans).
    //    If present, convert ISO strings to Firestore Timestamps and persist them.
    //    If absent (common for 'incomplete' status where no payment cycle has
    //    started yet), keep them as null; the webhook will populate them later.
    db
      .collection('users')
      .doc(uid)
      .set(
        {
          subscription: {
            provider: 'onvo',
            plan: 'premium',
            status: 'incomplete',

            onvoSubscriptionId: subscription.id,
            onvoCustomerId: customerId,
            onvoPaymentMethodId: paymentMethodId,

            currentPeriodStart: subscription.currentPeriodStart
              ? admin.firestore.Timestamp.fromDate(
                  new Date(subscription.currentPeriodStart)
                )
              : null,
            currentPeriodEnd: subscription.currentPeriodEnd
              ? admin.firestore.Timestamp.fromDate(
                  new Date(subscription.currentPeriodEnd)
                )
              : null,

            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd ?? false,

            activatedAt: null,
            canceledAt: null,

            renewalFailCount: 0,

            // Remove the lock timestamp written by acquireSubscriptionLock.
            // Leaving it would pollute the document indefinitely since
            // persistSubscriptionState uses { merge: true }.
            pendingLockedAt: admin.firestore.FieldValue.delete(),

            updatedAt: now,
          },
        },
        { merge: true }
      ),
  ]);
}
