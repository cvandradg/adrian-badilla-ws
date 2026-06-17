import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret, defineString } from 'firebase-functions/params';
import * as admin from 'firebase-admin';
import * as crypto from 'node:crypto';

// ─── Secrets & Config ─────────────────────────────────────────────────────────
const onvoWebhookSecret = defineSecret('ONVO_WEBHOOK_SECRET');
const onvoSecretKey = defineSecret('ONVO_SECRET_KEY');
const onvoApiUrl = defineString('ONVO_API_URL', {
  default: 'https://api.onvopay.com',
});

/**
 * handleOnvoWebhook
 *
 * HTTP trigger that receives ONVO Pay webhook events for recurring subscriptions
 * (ONVO Loop).
 *
 * THIS IS THE ONLY FUNCTION THAT ACTIVATES PREMIUM.
 * No other code path in the system should change subscription.status to 'active'.
 *
 * Security:
 *  - Validates X-Webhook-Secret header using timingSafeEqual (C-2, I-3).
 *  - Verifies first-payment intent against ONVO API before any Firestore write (C-2).
 *  - Uses paymentIntentId / invoiceId as payment document ID for idempotency (C-1).
 *  - Uses admin SDK — bypasses Firestore client security rules intentionally.
 *
 * Supported events:
 *  - payment-intent.succeeded       → activate subscription on first payment
 *  - payment-intent.failed          → mark subscription as incomplete
 *  - subscription.renewal.succeeded → update billing period, ensure active
 *  - subscription.renewal.failed    → mark as past_due, increment fail count
 *
 * Secrets: ONVO_WEBHOOK_SECRET, ONVO_SECRET_KEY
 * Config:  ONVO_API_URL
 */
export const handleOnvoWebhook = onRequest(
  { secrets: [onvoWebhookSecret, onvoSecretKey], invoker: 'public' },
  async (req, res) => {
    // ── Method guard ──────────────────────────────────────────────────────────
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    // ── Secret validation ─────────────────────────────────────────────────────
    // ONVO sends the configured webhook secret directly in the X-Webhook-Secret
    // header. Node.js/Express lowercases all header names, so we read
    // 'x-webhook-secret' (lowercase) to match 'X-Webhook-Secret'.
    const receivedSecret = req.headers['x-webhook-secret'] as
      | string
      | undefined;

    if (!receivedSecret) {
      res.status(400).send('Missing X-Webhook-Secret header.');
      return;
    }

    const expectedSecret = onvoWebhookSecret.value();
    let isValid = false;
    try {
      // timingSafeEqual requires equal-length buffers.
      // A length mismatch means invalid secret — the short-circuit keeps timing safe.
      isValid =
        receivedSecret.length === expectedSecret.length &&
        crypto.timingSafeEqual(
          Buffer.from(receivedSecret),
          Buffer.from(expectedSecret)
        );
    } catch {
      isValid = false;
    }

    if (!isValid) {
      console.warn('[billing] Webhook secret mismatch — rejected.');
      res.status(401).send('Invalid webhook secret.');
      return;
    }

    // ── Parse event ───────────────────────────────────────────────────────────
    const event = req.body as OnvoWebhookEvent;

    if (!event?.type || !event?.data) {
      res.status(400).send('Malformed webhook payload.');
      return;
    }

    console.info(`[billing] Webhook received: ${event.type}`);

    try {
      await processWebhookEvent(
        event,
        onvoSecretKey.value(),
        onvoApiUrl.value()
      );
      res.status(200).send('OK');
    } catch (err) {
      console.error('[billing] Error processing webhook', err);
      res.status(500).send('Internal error.');
    }
  }
);

// ─── Event dispatcher ─────────────────────────────────────────────────────────

/**
 * Routes each incoming webhook event type to its dedicated handler.
 * Keeping this function as a thin dispatcher ensures cognitive complexity
 * stays within the project lint limit.
 */
async function processWebhookEvent(
  event: OnvoWebhookEvent,
  apiKey: string,
  apiBaseUrl: string
): Promise<void> {
  const db = admin.firestore();
  const now = admin.firestore.FieldValue.serverTimestamp();
  const ctx: HandlerContext = { db, now, apiKey, apiBaseUrl };

  switch (event.type) {
    case 'payment-intent.succeeded':
      await handlePaymentIntentSucceeded(
        event.data as unknown as OnvoPaymentIntentSucceededData,
        ctx
      );
      break;
    case 'payment-intent.failed':
      await handlePaymentIntentFailed(
        event.data as unknown as OnvoPaymentIntentFailedData,
        ctx
      );
      break;
    case 'subscription.renewal.succeeded':
      await handleRenewalSucceeded(
        event.data as unknown as OnvoRenewalSucceededData,
        ctx
      );
      break;
    case 'subscription.renewal.failed':
      await handleRenewalFailed(
        event.data as unknown as OnvoRenewalFailedData,
        ctx
      );
      break;
    default:
      console.info(`[billing] Unhandled webhook event type: ${event.type}`);
  }
}

// ─── Event handlers ───────────────────────────────────────────────────────────

/**
 * payment-intent.succeeded
 * First charge on a new subscription was successful → activate premium.
 */
async function handlePaymentIntentSucceeded(
  data: OnvoPaymentIntentSucceededData,
  ctx: HandlerContext
): Promise<void> {
  const { id: paymentIntentId, customer, metadata, amount, currency } = data;
  const customerId = customer?.id;

  if (!paymentIntentId || !customerId) {
    console.error(
      '[billing] payment-intent.succeeded missing id or customer.id',
      data
    );
    return;
  }

  const uid = await resolveUid(customerId, metadata, ctx.db);
  if (!uid) {
    console.error(`[billing] Cannot resolve uid for customerId=${customerId}`);
    return;
  }

  const userRef = ctx.db.collection('users').doc(uid);
  // Idempotency: paymentIntentId as document key prevents double-activation.
  const paymentRef = userRef.collection('payments').doc(paymentIntentId);

  // Fast-path optimization: avoid transaction overhead when the payment document
  // already exists. This check is NOT the authoritative idempotency guard —
  // see tx.get() inside the transaction below. Two concurrent webhook deliveries
  // can both pass this check before either transaction commits.
  const paymentSnapOptimistic = await paymentRef.get();
  if (paymentSnapOptimistic.exists) {
    console.info(
      `[billing] Fast-path skip — paymentIntentId=${paymentIntentId} already processed.`
    );
    return;
  }

  // Verify against ONVO API before granting access.
  // NOTE (P8 audit): The original implementation also attempted to fetch
  // currentPeriodStart/End by extracting subscriptionId from the payment-intent
  // response. The official ONVO OpenAPI spec confirms GET /v1/payment-intents/{id}
  // does NOT return subscriptionId. That block has been removed.
  // Period dates will be populated when the first renewal.succeeded webhook arrives.
  const verified = await verifyPaymentIntent(
    paymentIntentId,
    ctx.apiKey,
    ctx.apiBaseUrl
  );
  if (!verified) {
    console.warn(
      `[billing] Verification failed for paymentIntentId=${paymentIntentId} — activation skipped.`
    );
    return;
  }

  await ctx.db.runTransaction(async (tx) => {
    // Authoritative idempotency guard (CRIT-2 fix).
    // tx.get() participates in Firestore's optimistic concurrency control: two
    // concurrent webhooks that both pass the fast-path check above will conflict
    // here — Firestore retries the second transaction, which then sees the payment
    // document written by the first and exits without writing.
    const paymentSnap = await tx.get(paymentRef);
    if (paymentSnap.exists) {
      console.info(
        `[billing] Idempotent skip (tx) — paymentIntentId=${paymentIntentId} already processed.`
      );
      return;
    }

    tx.set(
      userRef,
      {
        subscription: {
          status: 'active',
          activatedAt: ctx.now,
          updatedAt: ctx.now,
        },
      },
      { merge: true }
    );
    tx.set(paymentRef, {
      provider: 'onvo',
      amount: amount ?? 0,
      currency: currency ?? 'CRC',
      status: 'paid',
      paymentIntentId,
      createdAt: ctx.now,
    });
  });

  console.info(
    `[billing] Premium activated for uid=${uid}, paymentIntentId=${paymentIntentId}`
  );
}

/**
 * payment-intent.failed
 * First charge on a new subscription failed → mark subscription as incomplete.
 */
async function handlePaymentIntentFailed(
  data: OnvoPaymentIntentFailedData,
  ctx: HandlerContext
): Promise<void> {
  const customerId = data.customer?.id;

  if (!customerId) {
    console.error('[billing] payment-intent.failed missing customer.id', data);
    return;
  }

  const uid = await resolveUid(customerId, data.metadata, ctx.db);
  if (!uid) {
    console.warn(
      `[billing] Cannot resolve uid for customerId=${customerId} on payment-intent.failed — skipping.`
    );
    return;
  }

  await ctx.db
    .collection('users')
    .doc(uid)
    .set(
      {
        subscription: {
          status: 'incomplete',
          // P4: persist error details for support debugging.
          // Written only when ONVO provides the error object; existing documents
          // are not affected if no error is present (merge: true).
          // Set to null explicitly to clear any prior error on subsequent writes.
          lastPaymentError: data.error
            ? {
                code: data.error.code,
                type: data.error.type,
                message: data.error.message,
                occurredAt: ctx.now,
              }
            : null,
          updatedAt: ctx.now,
        },
      },
      { merge: true }
    );

  console.info(
    `[billing] First payment failed for uid=${uid}, customerId=${customerId}`
  );
}

/**
 * subscription.renewal.succeeded
 * Monthly charge processed successfully → update billing period, reset fail count.
 */
async function handleRenewalSucceeded(
  data: OnvoRenewalSucceededData,
  ctx: HandlerContext
): Promise<void> {
  const {
    id: invoiceId,
    subscriptionId,
    customerId,
    paymentIntentId,
    periodStart,
    periodEnd,
    total,
    currency,
    metadata,
  } = data;

  if (!invoiceId || !subscriptionId || !customerId) {
    console.error(
      '[billing] subscription.renewal.succeeded missing required fields',
      data
    );
    return;
  }

  const uid = await resolveUid(customerId, metadata, ctx.db);
  if (!uid) {
    console.error(`[billing] Cannot resolve uid for customerId=${customerId}`);
    return;
  }

  const userRef = ctx.db.collection('users').doc(uid);
  // Idempotency: invoiceId as document key prevents duplicate renewal records.
  const paymentRef = userRef.collection('payments').doc(invoiceId);

  // Fast-path optimization: avoid transaction overhead when the payment document
  // already exists. This check is NOT the authoritative idempotency guard —
  // see tx.get() inside the transaction below. Two concurrent webhook deliveries
  // can both pass this check before either transaction commits.
  const paymentSnapOptimistic = await paymentRef.get();
  if (paymentSnapOptimistic.exists) {
    console.info(
      `[billing] Fast-path skip — invoiceId=${invoiceId} already processed.`
    );
    return;
  }

  const periodStartTs = periodStart
    ? admin.firestore.Timestamp.fromDate(new Date(periodStart))
    : null;
  const periodEndTs = periodEnd
    ? admin.firestore.Timestamp.fromDate(new Date(periodEnd))
    : null;

  await ctx.db.runTransaction(async (tx) => {
    // Authoritative idempotency guard (CRIT-2 fix).
    // tx.get() participates in Firestore's optimistic concurrency control: two
    // concurrent webhooks that both pass the fast-path check above will conflict
    // here — Firestore retries the second transaction, which then sees the payment
    // document written by the first and exits without writing.
    const paymentSnap = await tx.get(paymentRef);
    if (paymentSnap.exists) {
      console.info(
        `[billing] Idempotent skip (tx) — invoiceId=${invoiceId} already processed.`
      );
      return;
    }

    const subscriptionUpdate: Record<string, unknown> = {
      status: 'active',
      renewalFailCount: 0,
      lastRenewalAt: ctx.now,
      updatedAt: ctx.now,
    };
    if (periodStartTs) subscriptionUpdate['currentPeriodStart'] = periodStartTs;
    if (periodEndTs) subscriptionUpdate['currentPeriodEnd'] = periodEndTs;

    tx.set(userRef, { subscription: subscriptionUpdate }, { merge: true });
    tx.set(paymentRef, {
      provider: 'onvo',
      amount: total ?? 0,
      currency: currency ?? 'CRC',
      status: 'paid',
      invoiceId,
      subscriptionId,
      paymentIntentId: paymentIntentId ?? '',
      periodStart: periodStartTs,
      periodEnd: periodEndTs,
      createdAt: ctx.now,
    });
  });

  console.info(
    `[billing] Renewal succeeded for uid=${uid}, invoiceId=${invoiceId}, periodEnd=${periodEnd}`
  );
}

/**
 * subscription.renewal.failed
 * Monthly charge failed → mark as past_due, set fail count from ONVO's
 * authoritative attemptCount. ONVO will retry automatically;
 * nextPaymentAttempt indicates when.
 *
 * P3 — Why attemptCount instead of FieldValue.increment(1)?
 *
 * ONVO fires one webhook per payment attempt. If the same event is delivered
 * more than once (duplicate webhook delivery — a common occurrence in any
 * HTTP-based webhook system), `FieldValue.increment(1)` would inflate the
 * counter beyond the real number of attempts.
 *
 * `attemptCount` is ONVO's authoritative value: it represents how many times
 * this specific invoice has been charged, regardless of how many times the
 * webhook fires. Writing it directly makes the counter idempotent.
 *
 * Trade-off: out-of-order delivery (attemptCount=2 arrives before
 * attemptCount=3) would temporarily set an earlier value. This is acceptable
 * because the next event will correct it, and the count resets to 0 on any
 * renewal.succeeded regardless.
 */
async function handleRenewalFailed(
  data: OnvoRenewalFailedData,
  ctx: HandlerContext
): Promise<void> {
  const { subscriptionId, customer, attemptCount, nextPaymentAttempt } = data;
  const customerId = customer?.id;

  if (!subscriptionId || !customerId) {
    console.error(
      '[billing] subscription.renewal.failed missing subscriptionId or customer.id',
      data
    );
    return;
  }

  const uid = await resolveUid(customerId, undefined, ctx.db);
  if (!uid) {
    console.warn(
      `[billing] Cannot resolve uid for customerId=${customerId} on renewal.failed — skipping.`
    );
    return;
  }

  const nextAttemptTs = nextPaymentAttempt
    ? admin.firestore.Timestamp.fromDate(new Date(nextPaymentAttempt))
    : null;

  const subscriptionUpdate: Record<string, unknown> = {
    status: 'past_due',
    // Use ONVO's authoritative attempt count (see P3 comment on the function).
    // Fall back to increment only if attemptCount is absent (unexpected, but
    // safe — prevents stalling the counter if ONVO omits the field).
    renewalFailCount:
      typeof attemptCount === 'number'
        ? attemptCount
        : admin.firestore.FieldValue.increment(1),
    updatedAt: ctx.now,
  };
  if (nextAttemptTs) subscriptionUpdate['nextPaymentAttempt'] = nextAttemptTs;

  await ctx.db
    .collection('users')
    .doc(uid)
    .set({ subscription: subscriptionUpdate }, { merge: true });

  console.info(
    `[billing] Renewal failed for uid=${uid}, subscriptionId=${subscriptionId}, attempt=${attemptCount}`
  );
}

// ─── UID Resolution ───────────────────────────────────────────────────────────

/**
 * Resolves a Firebase UID from an ONVO customerId.
 *
 * Resolution order:
 *  1. metadata.uid  — zero Firestore reads; set at subscription creation time.
 *  2. customers/{customerId} — written by createSubscription Cloud Function;
 *     used as fallback when metadata is absent (e.g. renewal.failed payloads).
 *
 * Returns null if resolution fails; all callers treat null as "skip processing".
 */
async function resolveUid(
  customerId: string,
  metadata: Record<string, string> | undefined,
  db: admin.firestore.Firestore
): Promise<string | null> {
  // 1. Fast path: uid is embedded in the event metadata
  if (metadata?.uid) {
    return metadata.uid;
  }

  // 2. Fallback: lookup the mapping document written by createSubscription
  try {
    const snap = await db.collection('customers').doc(customerId).get();
    if (snap.exists) {
      const uid = (snap.data() as { uid?: string }).uid;
      if (uid) return uid;
    }
  } catch (err) {
    console.error(
      `[billing] customers/{customerId} lookup failed for customerId=${customerId}`,
      err
    );
  }

  return null;
}

// ─── ONVO API verification ────────────────────────────────────────────────────

/**
 * Queries ONVO API to confirm a payment intent is in 'succeeded' state.
 * Used only for payment-intent.succeeded to guard against replayed or
 * fraudulent webhook calls before premium is granted.
 *
 * P8: Also returns subscriptionId if present in the payment intent response,
 * so that the caller can optionally fetch billing period dates. No extra API
 * call is made here — it's extracted from the same response body.
 *
 * Returns false on any failure — callers must treat this as "do not activate".
 *
 * Endpoint: GET /v1/payment-intents/{id}  (SecretApiKey)
 * Confirmed fields per ONVO OpenAPI spec: status, amount, currency, customerId,
 * metadata. subscriptionId is NOT present in this response.
 */
async function verifyPaymentIntent(
  paymentIntentId: string,
  apiKey: string,
  apiBaseUrl: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `${apiBaseUrl}/v1/payment-intents/${paymentIntentId}`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );

    if (!response.ok) {
      console.error(
        `[billing] ONVO payment-intent verification: HTTP ${response.status} for id=${paymentIntentId}`
      );
      return false;
    }

    const intent = (await response.json()) as { status?: string };
    return intent.status === 'succeeded';
  } catch (err) {
    console.error('[billing] ONVO payment-intent verification threw', err);
    return false;
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

/** Shared context passed to every event handler to avoid re-creating instances. */
interface HandlerContext {
  db: admin.firestore.Firestore;
  now: admin.firestore.FieldValue;
  apiKey: string;
  apiBaseUrl: string;
}

/**
 * Generic webhook envelope — event-specific data is cast per handler.
 */
interface OnvoWebhookEvent {
  type: string;
  data: Record<string, unknown>;
}

/**
 * Corresponds to ONVO OpenAPI schema WebhookSucceedePaymentIntentResponse.data
 * https://docs.onvopay.com
 */
interface OnvoPaymentIntentSucceededData {
  id: string;
  status: 'succeeded';
  amount: number;
  currency: string;
  accountId?: string;
  description?: string;
  createdAt?: string;
  metadata?: Record<string, string>;
  customer?: OnvoCustomerStub;
}

/**
 * Corresponds to ONVO OpenAPI schema WebhookErrorPaymentIntentResponse.data
 */
interface OnvoPaymentIntentFailedData {
  id: string;
  status: string;
  accountId?: string;
  currency?: string;
  metadata?: Record<string, string>;
  customer?: OnvoCustomerStub;
  error?: {
    type: string;
    code: string;
    message: string;
    paymentMethodType?: string;
    createdAt?: string;
  };
}

/**
 * Corresponds to ONVO OpenAPI schema WebhookSucceedeSubscriptionResponse.data
 * Note: customerId is a top-level field in this event (not nested inside customer).
 */
interface OnvoRenewalSucceededData {
  id: string; // invoice id — used as idempotency key
  status: 'paid';
  subscriptionId: string;
  customerId: string; // top-level field
  paymentIntentId: string;
  periodStart: string; // ISO 8601
  periodEnd: string; // ISO 8601
  total: number;
  currency: string;
  metadata?: Record<string, string>;
}

/**
 * Corresponds to ONVO OpenAPI schema WebhookErrorSubscriptionResponse.data
 * Note: customerId is accessed via customer.id (nested object).
 */
interface OnvoRenewalFailedData {
  subscriptionId: string;
  paymentIntentId?: string;
  subscriptionStatus: string;
  invoiceStatus?: string;
  attemptCount: number;
  nextPaymentAttempt?: string; // ISO 8601
  lastPaymentAttempt?: string; // ISO 8601
  invoicePeriodStart?: string;
  invoicePeriodEnd?: string;
  periodStart?: string;
  periodEnd?: string;
  customer: OnvoCustomerStub; // nested — use customer.id as customerId
  error?: {
    code: string;
    type: string;
    message: string;
  };
}

/** Minimal customer shape present in multiple ONVO webhook payloads. */
interface OnvoCustomerStub {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
}
