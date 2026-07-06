import { HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

// ─── Shared types ─────────────────────────────────────────────────────────────

interface OnvoCustomerCreateResponse {
  id: string;
}

// ─── ONVO Customer resolution ─────────────────────────────────────────────────

/**
 * Resolves the ONVO customer ID for the given Firebase UID.
 *
 * Security: customerId is never accepted from the client. This function is the
 * single source of truth for the Firebase UID → ONVO customer mapping.
 * It prevents CRIT-1 (OWASP A01): a malicious caller supplying another user's
 * customerId would poison customers/{customerId} → uid, causing future webhooks
 * for that customer to activate the wrong Firebase account.
 *
 * Persistence model:
 *  - customers/{customerId}               ← authoritative reverse-mapping used
 *                                            by webhooks (written here immediately
 *                                            when a new ONVO customer is created).
 *  - users/{uid}.subscription.onvoCustomerId ← forward-mapping / recovery path;
 *                                            used by resolveUid() when the
 *                                            customers document is absent.
 *
 * Resolution order:
 *  1. Read users/{uid}.subscription.onvoCustomerId — reuses the existing
 *     customer without calling ONVO again (idempotent across retries).
 *  2. If absent: fetch the Firebase Auth user record, call POST /v1/customers,
 *     persist customers/{customerId} AND users/{uid}.subscription.onvoCustomerId
 *     atomically so the reverse mapping is immediately available for webhooks.
 */
export async function getOrCreateOnvoCustomer(
  uid: string,
  apiKey: string,
  apiBase: string,
  db: admin.firestore.Firestore
): Promise<string> {
  // 1. Reuse existing ONVO customer if already provisioned for this UID.
  const userSnap = await db.collection('users').doc(uid).get();
  const subscription = userSnap.data()?.['subscription'] as
    | { onvoCustomerId?: string }
    | undefined;

  if (subscription?.onvoCustomerId) {
    console.info(
      `[billing] getOrCreateOnvoCustomer: reusing customerId for uid=${uid}`
    );
    return subscription.onvoCustomerId;
  }

  // 2. Fetch Firebase Auth user record to populate ONVO customer fields.
  const authUser = await admin.auth().getUser(uid);

  // 3. Create a new customer in ONVO via POST /v1/customers.
  const createResponse = await fetch(`${apiBase}/v1/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      name: authUser.displayName ?? authUser.email ?? uid,
      email: authUser.email,
      ...(authUser.phoneNumber ? { phone: authUser.phoneNumber } : {}),
    }),
  });

  if (!createResponse.ok) {
    const errorBody = await createResponse.text();
    console.error(
      `[billing] ONVO POST /v1/customers failed: HTTP ${createResponse.status}`,
      errorBody
    );
    throw new HttpsError('internal', 'Could not provision billing account.');
  }

  const customer = (await createResponse.json()) as OnvoCustomerCreateResponse;
  const customerId = customer.id;
  const now = admin.firestore.FieldValue.serverTimestamp();

  // 4. Persist both mappings concurrently:
  //    a) users/{uid}.subscription.onvoCustomerId — forward mapping / recovery path.
  //    b) customers/{customerId} — authoritative reverse mapping used by webhooks.
  //    Writing both here ensures the webhook can always resolve uid even if
  //    createSubscription() fails before persistSubscriptionState() runs.
  await Promise.all([
    db
      .collection('users')
      .doc(uid)
      .set({ subscription: { onvoCustomerId: customerId } }, { merge: true }),
    db
      .collection('customers')
      .doc(customerId)
      .set({ uid, createdAt: now }, { merge: true }),
  ]);

  console.info(
    `[billing] getOrCreateOnvoCustomer: created customerId=${customerId} for uid=${uid}`
  );
  return customerId;
}
