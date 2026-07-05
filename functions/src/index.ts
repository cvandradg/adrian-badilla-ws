import { initializeApp } from 'firebase-admin/app';
import { setGlobalOptions } from 'firebase-functions/v2';

initializeApp();

setGlobalOptions({ maxInstances: 10 });

// ─── ONVO Loop (recurring subscriptions) ─────────────────────────────────────
export { resolveCustomer } from './billing/resolve-customer.function';
export { createSubscription } from './billing/create-subscription.function';
export { getSubscriptionStatus } from './billing/get-subscription-status.function';
export { cancelSubscription } from './billing/cancel-subscription.function';
export { handleOnvoWebhook } from './billing/handle-onvo-webhook.function';
export { syncSubscriptionStatus } from './billing/sync-subscription-status.function';

// ─── Legacy checkout (kept for rollback — remove after migration is stable) ───
export { createCheckoutSession } from './billing/create-checkout-session.function';
export { verifyTransaction } from './billing/verify-transaction.function';

// ─── AI Coach ─────────────────────────────────────────────────────────────────
// All OpenAI communication happens exclusively here.
// Angular never calls OpenAI directly — all calls go through these functions.
export { aiChat } from './ai/chat.function';
export { aiCoach } from './ai/coach.function';
export { aiAssessment } from './ai/assessment.function';
export { aiRecommendation } from './ai/recommendation.function';
export { aiMemory } from './ai/memory.function';
export { aiNutrition } from './ai/nutrition.function';
export { aiRoutine } from './ai/routine.function';

// ─── Development-only utilities (never deployed to production) ────────────────
// testOnvoWebhook is conditionally added to exports ONLY when
// FUNCTIONS_EMULATOR=true, which is set automatically by `firebase emulators:start`
// and is never present in Cloud Run / production deployments.
// This means Firebase CLI will never see — and therefore never deploy — this
// function during a normal `firebase deploy` run.
if (process.env.FUNCTIONS_EMULATOR === 'true') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const testModule = require('./billing/test-webhook.function') as {
    testOnvoWebhook: unknown;
  };
  (exports as Record<string, unknown>)['testOnvoWebhook'] =
    testModule.testOnvoWebhook;
}
