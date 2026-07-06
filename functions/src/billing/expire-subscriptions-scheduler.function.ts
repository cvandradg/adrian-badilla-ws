import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Maximum documents processed per WriteBatch.
 * Firestore hard-limits a WriteBatch to 500 operations.
 * 100 keeps memory pressure low and gives headroom if field count grows.
 */
const BATCH_SIZE = 100;

/**
 * expireSubscriptionsScheduler
 *
 * ── Role: reconciliation safety-net, NOT the primary source of truth ──────────
 *
 * The ONVO webhook (handleOnvoWebhook) is the primary mechanism for updating
 * subscription state. When a subscription ends, ONVO fires a webhook that
 * immediately sets status = 'cancelled' in Firestore. That path is always
 * preferred and continues to function exactly as designed.
 *
 * This scheduler activates ONLY when the webhook path fails:
 *   - ONVO did not deliver the webhook (outage, transient error)
 *   - The Firebase Function crashed before writing to Firestore
 *   - A temporary network partition prevented the write
 *
 * Flow:
 *
 *   ONVO webhook (primary)
 *   └─ handleOnvoWebhook → Firestore: status = 'cancelled'  (immediate)
 *
 *   expireSubscriptionsScheduler (safety-net)
 *   └─ runs every 15 min → queries docs still 'active' past currentPeriodEnd
 *      └─ writes status = 'cancelled' only for those that slipped through
 *
 * ── Trigger condition ─────────────────────────────────────────────────────────
 * A document is eligible when ALL three conditions are true simultaneously:
 *   subscription.cancelAtPeriodEnd == true    (user requested end-of-period cancel)
 *   subscription.status            == 'active' (still 'active' — webhook hasn't fired)
 *   subscription.currentPeriodEnd  <= now()    (billing period has elapsed)
 *
 * ── Batch-loop strategy ───────────────────────────────────────────────────────
 * Processes ALL eligible documents in a single execution using a while loop.
 * Each iteration: query(limit(100)) → WriteBatch → commit.
 * After each commit the updated documents are no longer 'active', so the next
 * query naturally returns the following page without any cursor bookkeeping.
 * Loop exits when the query returns an empty snapshot.
 *
 *   Example — 250 pending expirations:
 *     Iteration 1: query → 100 docs → commit  (totalExpired = 100)
 *     Iteration 2: query → 100 docs → commit  (totalExpired = 200)
 *     Iteration 3: query →  50 docs → commit  (totalExpired = 250)
 *     Iteration 4: query →   0 docs → break
 *
 * ── What it writes ────────────────────────────────────────────────────────────
 * Per eligible document — only these three fields change:
 *   subscription.status        = 'cancelled'
 *   subscription.accessEndedAt = serverTimestamp()
 *   subscription.updatedAt     = serverTimestamp()
 *
 * Fields NEVER modified:
 *   plan, onvoSubscriptionId, onvoCustomerId, currentPeriodEnd,
 *   billingCycle, cancelAtPeriodEnd, canceledAt, cancelRequestedAt.
 *
 * ── Idempotency ───────────────────────────────────────────────────────────────
 * The query filters on status == 'active'. A document set to 'cancelled' in any
 * previous execution — by this scheduler, a webhook, or any other path — will
 * never match the query again. Running this scheduler N times always produces
 * the same final state.
 *
 * ── Cost profile ──────────────────────────────────────────────────────────────
 * The query uses a fully defined composite index on three fields
 * (cancelAtPeriodEnd, status, currentPeriodEnd — see firestore.indexes.json).
 * Firestore only scans documents that satisfy all three filter conditions;
 * no full-collection scan occurs regardless of user count.
 *
 * In the common case (no subscriptions expired since last tick) the query
 * returns immediately after reading the minimal index entries. Cost is kept
 * to a minimum: only genuinely eligible documents are read, and only those
 * are written.
 *
 * ── Composite index required ─────────────────────────────────────────────────
 * Collection : users
 * Fields     : subscription.cancelAtPeriodEnd ASC
 *              subscription.status             ASC
 *              subscription.currentPeriodEnd   ASC
 * Defined in : firestore.indexes.json
 *
 * ── Relationship with syncSubscriptionStatus ─────────────────────────────────
 * syncSubscriptionStatus (daily, 03:00 UTC) handles both 'cancelled' and
 * 'past_due' cases as a broader safety-net. This scheduler is a narrower,
 * faster path limited to user-requested cancellations, ensuring access ends
 * within ≤ 15 minutes of currentPeriodEnd.
 *
 * ── External calls ────────────────────────────────────────────────────────────
 * None. No ONVO calls, no HTTP requests. Firestore-only.
 *
 * Schedule : every 15 minutes
 * TimeZone : UTC
 */
export const expireSubscriptionsScheduler = onSchedule(
  { schedule: '*/15 * * * *', timeZone: 'UTC' },
  async () => {
    const db = admin.firestore();
    const serverTimestamp = admin.firestore.FieldValue.serverTimestamp();

    // Capture `now` once so every batch in this execution uses the same
    // reference point. Documents that expire mid-execution are picked up
    // on the next tick, which is correct and avoids unbounded loop growth.
    const now = admin.firestore.Timestamp.now();

    let totalExpired = 0;
    let startedAt = 0; // set on first non-empty batch to avoid useless Date.now() calls

    // ── Batch loop ────────────────────────────────────────────────────────────
    // Each iteration processes one page of BATCH_SIZE documents.
    // The loop exits when the query returns an empty snapshot, which happens
    // once every eligible document has been updated and the index no longer
    // returns any 'active' + 'cancelAtPeriodEnd' + expired documents.
    while (true) {
      let snapshot: admin.firestore.QuerySnapshot;

      try {
        snapshot = await db
          .collection('users')
          .where('subscription.cancelAtPeriodEnd', '==', true)
          .where('subscription.status', '==', 'active')
          .where('subscription.currentPeriodEnd', '<=', now)
          .limit(BATCH_SIZE)
          .get();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(
          '[expireSubscriptionsScheduler] Firestore query failed ' +
            `totalExpiredSoFar=${totalExpired} error="${msg}"`
        );
        throw err;
      }

      // ── Exit condition ──────────────────────────────────────────────────────
      // No documents left to process — either none were ever pending or all
      // previous batches already handled them.
      if (snapshot.empty) {
        break;
      }

      // ── Mark start time on first non-empty batch ────────────────────────────
      // This avoids generating any timestamps (or logs) on fully idle ticks.
      if (totalExpired === 0) {
        startedAt = Date.now();
        console.info(
          '[expireSubscriptionsScheduler] processing started — ' +
            'found documents to expire'
        );
      }

      // ── Build and commit WriteBatch ─────────────────────────────────────────
      // One batch per page: max BATCH_SIZE updates per commit call (1 RPC).
      // WriteBatch is correct here because BATCH_SIZE (100) is well within
      // Firestore's 500-operation batch limit.
      const batch = db.batch();

      for (const docSnap of snapshot.docs) {
        batch.update(docSnap.ref, {
          'subscription.status': 'cancelled',
          'subscription.accessEndedAt': serverTimestamp,
          'subscription.updatedAt': serverTimestamp,
        });
      }

      try {
        await batch.commit();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(
          '[expireSubscriptionsScheduler] batch.commit failed ' +
            `batchSize=${snapshot.size} totalExpiredSoFar=${totalExpired} error="${msg}"`
        );
        throw err;
      }

      totalExpired += snapshot.size;

      // ── Early exit optimisation ─────────────────────────────────────────────
      // If this page had fewer docs than the limit, there are no more pages.
      // Skip the final empty-query round-trip.
      if (snapshot.size < BATCH_SIZE) {
        break;
      }
    }

    // ── Final log — only when work was done ───────────────────────────────────
    if (totalExpired > 0) {
      const elapsedMs = Date.now() - startedAt;
      console.info(
        '[expireSubscriptionsScheduler] complete — ' +
          `expired=${totalExpired} elapsed=${elapsedMs}ms`
      );
    }
  }
);
