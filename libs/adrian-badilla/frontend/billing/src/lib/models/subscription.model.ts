import type { Timestamp } from 'firebase/firestore';

// ─── Plan Types ───────────────────────────────────────────────────────────────

export type SubscriptionPlan = 'free' | 'premium';

export type SubscriptionStatus =
  | 'inactive'
  | 'active'
  | 'past_due'
  | 'cancelled'
  | 'incomplete'
  | 'trialing';

// ─── Firestore Shape ──────────────────────────────────────────────────────────

/**
 * Shape of the `subscription` field embedded in `users/{uid}`.
 * Written exclusively by Firebase Functions via admin SDK.
 * The Angular client never writes this field directly.
 *
 * Migration note: `expiresAt` and `transactionId` / `subscriptionId` are kept
 * as optional for backwards compatibility while old documents still exist.
 * New documents written by `createSubscription` will NOT include these fields.
 * Use `currentPeriodEnd` for all billing-cycle logic going forward.
 */
export interface Subscription {
  provider: 'onvo';
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  updatedAt: Timestamp;

  // ── ONVO Loop fields (written by createSubscription + webhook) ─────────────
  onvoSubscriptionId?: string;
  onvoCustomerId?: string;
  onvoPaymentMethodId?: string;
  currentPeriodStart?: Timestamp | null;
  currentPeriodEnd?: Timestamp | null;
  cancelAtPeriodEnd?: boolean;
  activatedAt?: Timestamp | null;
  canceledAt?: Timestamp | null;
  lastRenewalAt?: Timestamp | null;
  renewalFailCount?: number;
  nextPaymentAttempt?: Timestamp | null;
  startedAt?: Timestamp;

  // ── Legacy fields (checkout flow) — kept for transition period ─────────────
  /** @deprecated Use onvoSubscriptionId */
  subscriptionId?: string;
  /** @deprecated No ONVO equivalent — use currentPeriodEnd */
  expiresAt?: Timestamp;
  /** @deprecated Use paymentIntentId in payments subcollection */
  transactionId?: string;
}

// ─── ONVO Checkout (legacy — kept for rollback) ───────────────────────────────

/** Payload sent to the `createCheckoutSession` Firebase Callable Function. */
export interface CreateCheckoutPayload {
  plan: SubscriptionPlan;
}

/** Response from the `createCheckoutSession` Firebase Callable Function. */
export interface CheckoutSessionResult {
  checkoutUrl: string;
  sessionId: string;
}

/** Payload sent to the `verifyTransaction` Firebase Callable Function. */
export interface VerifyPaymentPayload {
  sessionId: string;
}

/** Response from the `verifyTransaction` Firebase Callable Function. */
export interface VerifyPaymentResult {
  status: SubscriptionStatus;
  transactionId: string | null;
}

// ─── ONVO Loop ────────────────────────────────────────────────────────────────

/**
 * Payload sent to the `createSubscription` Firebase Callable Function.
 * customerId is intentionally absent \u2014 it is resolved server-side.
 * Sending customerId from Angular was a CRIT-1 security vulnerability.
 */
export interface CreateSubscriptionPayload {
  paymentMethodId: string;
}

/** Response from the `createSubscription` Firebase Callable Function. */
export interface CreateSubscriptionResult {
  success: true;
  subscriptionId: string;
  status: string;
}

/** Payload sent to the `getSubscriptionStatus` Firebase Callable Function. */
export interface SubscriptionStatusPayload {
  subscriptionId: string;
}

/** Response from the `getSubscriptionStatus` Firebase Callable Function. */
export interface SubscriptionStatusResult {
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

/** Payload sent to the `cancelSubscription` Firebase Callable Function. */
export interface CancelSubscriptionPayload {
  subscriptionId: string;
}

/** Response from the `resolveCustomer` Firebase Callable Function. */
export interface ResolveCustomerResult {
  customerId: string;
  publishableKey: string;
}

// ─── ONVO Payment Methods (client-side API) ───────────────────────────────────

/**
 * Card data collected from the user to create an ONVO Payment Method.
 * Sent directly from Angular to POST /v1/payment-methods using the publishableKey.
 * Based on ONVO OpenAPI: CreatePaymentMethodRequest.card.
 *
 * Security: these fields MUST NOT be sent to any backend endpoint.
 * They travel directly from Angular to api.onvopay.com using the publishable
 * (client-safe) key. The Firebase backend never receives raw card data.
 */
export interface OnvoCardInput {
  /** Card number, digits only, no spaces (e.g. "4111111111111111"). */
  number: string;
  /** Expiration month, 1–12. */
  expMonth: number;
  /** Expiration year, 4 digits (e.g. 2028). */
  expYear: number;
  /**
   * Card verification code — named `cvc` internally but sent as `cvv` to ONVO.
   * ONVO OpenAPI uses the field name `cvv`; `cvc` is rejected with HTTP 400.
   */
  cvc: string;
  /** Full name on the card, as printed. Required by ONVO API. */
  holderName: string;
}

/**
 * Response from ONVO POST /v1/payment-methods.
 * Only the fields used by this application are mapped.
 * Based on ONVO OpenAPI: PaymentMethod schema.
 *
 * The `id` field is the paymentMethodId passed to `createSubscription`.
 */
export interface OnvoPaymentMethodResponse {
  /** ONVO Payment Method ID — passed to createSubscription({ paymentMethodId }). */
  id: string;
  /** Always "card" for card-based payment methods. */
  type: 'card';
  /** The ONVO customer ID this payment method is bound to. */
  customerId: string;
  /** Masked card details returned by ONVO — safe to display in UI. */
  card: {
    last4: string;
    brand: string;
    expMonth: number;
    expYear: number;
  };
}
