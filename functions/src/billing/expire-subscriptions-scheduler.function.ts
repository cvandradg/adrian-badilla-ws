import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';

/**
 * expireSubscriptionsScheduler
 *
 * Scheduled Cloud Function that runs every 15 minutes and expires subscriptions
 * whose billing period has ended after a user-requested cancellation.
 *
 * ── Trigger condition ─────────────────────────────────────────────────────────
 * A document is eligible when ALL three conditions are true simultaneously:
 *   subscription.cancelAtPeriodEnd == true   (user requested end-of-period cancel)
 *   subscription.status           == 'active' (still showing as active)
 *   subscription.currentPeriodEnd <= now()    (billing period has elapsed)
 *
 * ── What it writes ────────────────────────────────────────────────────────────
 * Per eligible document (merged — all other fields are left untouched):
 *   subscription.status        = 'cancelled'
 *   subscription.accessEndedAt = serverTimestamp()
 *   subscription.updatedAt     = serverTimestamp()
 *
 * Fields never modified: onvoSubscriptionId, currentPeriodEnd, onvoCustomerId,
 *   plan, billingCycle, cancelAtPeriodEnd, canceledAt.
 *
 * ── Idempotency ───────────────────────────────────────────────────────────────
 * The query filters on status == 'active'. Once a document is written with
 * status = 'cancelled', it no longer satisfies the query and is never touched
 * by subsequent executions — naturally idempotent.
 *
 * ── Cost profile ──────────────────────────────────────────────────────────────
 * Reads  : 0 when no documents qualify (Firestore charges 0 reads on empty results).
 *          Up to 100 reads when documents are found.
 * Writes : 0–100 per execution (one batch.update per eligible doc).
 * The limit(100) cap ensures cost is bounded per execution.
 *
 * ── Composite index required ─────────────────────────────────────────────────
 * Collection : users
 * Fields     : subscription.cancelAtPeriodEnd ASC
 *              subscription.status             ASC
 *              subscription.currentPeriodEnd   ASC
 * Defined in : firestore.indexes.json
 *
 * ── Relationship with syncSubscriptionStatus ─────────────────────────────────
 * syncSubscriptionStatus is a daily safety-net that handles both cancelled and
 * past_due cases. This scheduler is the fast path: it fires every 15 minutes
 * and handles only the cancelled case, ensuring users lose access within
 * ≤ 15 minutes of currentPeriodEnd regardless of ONVO webhook delivery.
 *
 * ── External calls ────────────────────────────────────────────────────────────
 * None. No ONVO calls, no HTTP requests. Firestore-only.
 *
 * Schedule: every 15 minutes (cron: "* /15 * * * *" — space added to avoid comment termination)
 * TimeZone: UTC
 */
export const expireSubscriptionsScheduler = onSchedule(
  { schedule: '*/15 * * * *', timeZone: 'UTC' },
  async () => {
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();

    // ── Query ─────────────────────────────────────────────────────────────────
    // Three-field composite query — fully indexed (see firestore.indexes.json).
    // limit(100) bounds cost per execution and prevents memory pressure.
    let snapshot: admin.firestore.QuerySnapshot;
    try {
      snapshot = await db
        .collection('users')
        .where('subscription.cancelAtPeriodEnd', '==', true)
        .where('subscription.status', '==', 'active')
        .where('subscription.currentPeriodEnd', '<=', now)
        .limit(100)
        .get();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(
        `[expireSubscriptionsScheduler] Firestore query failed error="${msg}"`
      );
      throw err;
    }

    // ── Fast exit when nothing to do ──────────────────────────────────────────
    // No log: keeping Cloud Logging costs zero on the common (idle) path.
    if (snapshot.empty) {
      return;
    }

    // ── Build batch ───────────────────────────────────────────────────────────
    // WriteBatch is correct here: max 500 ops per batch, we cap at 100 docs.
    // Each document requires exactly 1 update → max 100 ops, well within limit.
    const batch = db.batch();
    const serverTimestamp = admin.firestore.FieldValue.serverTimestamp();

    for (const docSnap of snapshot.docs) {
      batch.update(docSnap.ref, {
        'subscription.status': 'cancelled',
        'subscription.accessEndedAt': serverTimestamp,
        'subscription.updatedAt': serverTimestamp,
      });
    }

    // ── Commit ────────────────────────────────────────────────────────────────
    try {
      await batch.commit();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(
        `[expireSubscriptionsScheduler] batch.commit failed ` +
          `docs=${snapshot.size} error="${msg}"`
      );
      throw err;
    }

    // ── Log only when work was done ───────────────────────────────────────────
    const uids = snapshot.docs.map((d) => d.id).join(', ');
    console.info(
      `[expireSubscriptionsScheduler] expired ${snapshot.size} subscription(s) uid=[${uids}]`
    );
  }
);
