import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';

/**
 * syncSubscriptionStatus
 *
 * Scheduled safety net that runs daily at 03:00 UTC to correct subscriptions
 * whose billing period has ended but whose status was not updated by the webhook
 * (e.g. ONVO outage, missed delivery, network partition).
 *
 * Logic per expired document:
 *   - cancelAtPeriodEnd === true  → mark as 'canceled'
 *     (user requested cancellation; period is now over — access should end)
 *   - cancelAtPeriodEnd === false → mark as 'past_due'
 *     (unexpected lapse — ONVO should retry; flag for support review)
 *
 * Field change (ONVO Loop migration):
 *   OLD: subscription.expiresAt  ← legacy field, never populated by ONVO
 *   NEW: subscription.currentPeriodEnd ← set by webhook on every renewal
 *
 * Firestore composite index required (create in Firebase Console or firestore.indexes.json):
 *   Collection: users
 *   Fields:     subscription.status ASC, subscription.currentPeriodEnd ASC
 *
 * Schedule: Every day at 03:00 UTC
 */
export const syncSubscriptionStatus = onSchedule(
  { schedule: '0 3 * * *', timeZone: 'UTC' },
  async () => {
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();
    const serverTimestamp = admin.firestore.FieldValue.serverTimestamp();

    // Query subscriptions that are still 'active' but whose billing period
    // has ended. Only 'active' subscriptions need to be corrected; 'incomplete',
    // 'past_due', and 'canceled' subscriptions are already in a terminal state.
    // Requires composite index: subscription.status + subscription.currentPeriodEnd
    const snapshot = await db
      .collection('users')
      .where('subscription.status', '==', 'active')
      .where('subscription.currentPeriodEnd', '<=', now)
      .get();

    if (snapshot.empty) {
      console.info(
        '[billing] syncSubscriptionStatus: no expired subscriptions found.'
      );
      return;
    }

    const batch = db.batch();
    let canceledCount = 0;
    let pastDueCount = 0;

    snapshot.docs.forEach((docSnap) => {
      const sub = docSnap.data()?.['subscription'] as
        | { cancelAtPeriodEnd?: boolean }
        | undefined;

      // Distinguish between user-requested cancellations and unexpected lapses.
      const newStatus =
        sub?.cancelAtPeriodEnd === true ? 'cancelled' : 'past_due';

      batch.update(docSnap.ref, {
        'subscription.status': newStatus,
        'subscription.updatedAt': serverTimestamp,
      });

      if (newStatus === 'cancelled') {
        canceledCount++;
      } else {
        pastDueCount++;
      }
    });

    await batch.commit();

    console.info(
      `[billing] syncSubscriptionStatus: processed ${snapshot.size} subscription(s) ` +
        `(cancelled=${canceledCount}, past_due=${pastDueCount}).`
    );
  }
);
