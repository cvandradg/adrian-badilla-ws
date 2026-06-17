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
