import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret, defineString } from 'firebase-functions/params';
import {
  processWebhookEvent,
  OnvoWebhookEvent,
} from './handle-onvo-webhook.function';

// ─── Secrets & Config (same references as the real webhook) ──────────────────
// Defining these here tells Firebase to provision the secrets for this function.
// Multiple defineSecret() calls for the same name are allowed — they reference
// the same underlying secret; no duplication occurs.
const onvoSecretKey = defineSecret('ONVO_SECRET_KEY');
const onvoApiUrl = defineString('ONVO_API_URL', {
  default: 'https://api.onvopay.com',
});

const SUPPORTED_EVENTS = new Set([
  'payment-intent.succeeded',
  'payment-intent.failed',
  'subscription.renewal.succeeded',
  'subscription.renewal.failed',
]);

/**
 * testOnvoWebhook
 *
 * Manual webhook trigger for LOCAL DEVELOPMENT / Firebase Emulator ONLY.
 *
 * WHY THIS EXISTS
 * ──────────────
 * ONVO Pay does not support manually firing webhook events from its sandbox
 * dashboard (particularly subscription renewal events). This endpoint lets
 * developers trigger the exact same processing pipeline that the real
 * handleOnvoWebhook uses, without needing ONVO to send an actual event.
 *
 * ARCHITECTURE
 * ────────────
 * This function calls processWebhookEvent() directly — the same exported
 * function invoked by the production handleOnvoWebhook endpoint. There is
 * zero duplication: both paths share a single implementation.
 *
 *   handleOnvoWebhook  ──┐
 *                        ├──▶ processWebhookEvent()  ──▶ Firestore
 *   testOnvoWebhook    ──┘
 *
 * ENVIRONMENT GUARD
 * ─────────────────
 * This function is NEVER registered in production.
 * index.ts only adds it to the exports object when FUNCTIONS_EMULATOR=true,
 * which is set automatically by `firebase emulators:start` and is never
 * present in Cloud Run / production environments.
 * A secondary runtime guard returns 404 on any stray production request.
 *
 * IMPORTANT: payment-intent.succeeded
 * ─────────────────────────────────────
 * The real handler calls verifyPaymentIntent() which hits the ONVO sandbox API.
 * To avoid skipping activation during tests, either:
 *  a) Provide a real paymentIntentId that exists in your ONVO sandbox, OR
 *  b) Use subscription.renewal.succeeded instead (no external verification step).
 *
 * USAGE
 * ─────
 * 1. Start the emulator:  firebase emulators:start --only functions
 * 2. POST http://127.0.0.1:5001/<project-id>/us-central1/testOnvoWebhook
 *    Content-Type: application/json
 *    Body: { "type": "...", "data": { ... } }
 *
 * See functions/src/billing/test-payloads.json for ready-to-use example bodies.
 */
export const testOnvoWebhook = onRequest(
  { secrets: [onvoSecretKey], invoker: 'public', cors: true },
  async (req, res) => {
    // ── Environment guard (primary) ───────────────────────────────────────────
    // FUNCTIONS_EMULATOR is set by the Firebase emulator and is never present
    // in deployed Cloud Run instances.
    if (process.env.FUNCTIONS_EMULATOR !== 'true') {
      console.warn('[billing/test] Request blocked — not running in emulator.');
      res.status(404).json({ error: 'Not found.' });
      return;
    }

    // ── Method guard ──────────────────────────────────────────────────────────
    if (req.method !== 'POST') {
      res
        .status(405)
        .json({ error: 'Method Not Allowed. Use POST with a JSON body.' });
      return;
    }

    const startedAt = Date.now();
    const body = req.body as { type?: unknown; data?: unknown };

    console.info('[billing/test] ──────────────────────────────────────────');
    console.info('[billing/test] Incoming test webhook request');

    // ── Payload validation ────────────────────────────────────────────────────
    if (
      typeof body?.type !== 'string' ||
      typeof body?.data !== 'object' ||
      body.data === null
    ) {
      res.status(400).json({
        error: 'Request body must be { "type": string, "data": object }.',
        hint: 'See functions/src/billing/test-payloads.json for ready-to-use examples.',
      });
      return;
    }

    if (!SUPPORTED_EVENTS.has(body.type)) {
      res.status(400).json({
        error: `Unsupported event type: "${body.type}".`,
        supported: [...SUPPORTED_EVENTS],
      });
      return;
    }

    const event: OnvoWebhookEvent = {
      type: body.type,
      data: body.data as Record<string, unknown>,
    };

    console.info(`[billing/test] ▶  Event type : ${event.type}`);
    console.info(
      `[billing/test]    Payload   : ${JSON.stringify(event.data, null, 2)}`
    );

    // ── Execute — identical to the real webhook pipeline ──────────────────────
    // processWebhookEvent() is the same function called by handleOnvoWebhook.
    // No code is duplicated. Both paths share one implementation.
    try {
      await processWebhookEvent(
        event,
        onvoSecretKey.value(),
        onvoApiUrl.value()
      );

      const durationMs = Date.now() - startedAt;

      console.info(
        `[billing/test] ✓  Completed in ${durationMs}ms — check emulator logs for Firestore writes.`
      );
      console.info('[billing/test] ──────────────────────────────────────────');

      const notes: string[] = [];
      if (event.type === 'payment-intent.succeeded') {
        notes.push(
          'payment-intent.succeeded runs verifyPaymentIntent() against the ONVO sandbox API. ' +
            'If the paymentIntentId is not a real sandbox ID, activation will be skipped ' +
            '(look for "Verification failed" in the logs above).'
        );
      }

      res.status(200).json({
        ok: true,
        event: event.type,
        durationMs,
        ...(notes.length > 0 ? { notes } : {}),
      });
    } catch (err) {
      const durationMs = Date.now() - startedAt;
      const message = err instanceof Error ? err.message : String(err);

      console.error(
        `[billing/test] ✗  Processing failed after ${durationMs}ms`,
        err
      );
      console.info('[billing/test] ──────────────────────────────────────────');

      res.status(500).json({
        ok: false,
        event: event.type,
        durationMs,
        error: message,
      });
    }
  }
);
