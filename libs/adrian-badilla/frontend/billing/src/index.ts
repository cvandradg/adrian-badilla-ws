// ── Store ─────────────────────────────────────────────────────────────────────
export { billingStore } from './lib/store/billing.store';
export type { BillingStore } from './lib/store/billing.store';

// ── Routes ────────────────────────────────────────────────────────────────────
export { billingRoutes } from './lib/billing.routes';

// ── Guard ─────────────────────────────────────────────────────────────────────
export { premiumGuard } from './lib/guards/premium.guard';

// ── Components ────────────────────────────────────────────────────────────────
export { PremiumBannerComponent } from './lib/components/premium-banner/premium-banner.component';
export { SubscriptionCardComponent } from './lib/components/subscription-card/subscription-card.component';
export { SubscriptionStatusChipComponent } from './lib/components/subscription-status-chip/subscription-status-chip.component';
export { CheckoutButtonComponent } from './lib/components/checkout-button/checkout-button.component';

// ── Models ────────────────────────────────────────────────────────────────────
export type {
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
  CreateCheckoutPayload,
  CheckoutSessionResult,
  VerifyPaymentPayload,
  VerifyPaymentResult,
} from './lib/models/subscription.model';
export type { PaymentRecord } from './lib/models/payment.model';

// ── Config ────────────────────────────────────────────────────────────────────
export type { FeatureName } from './lib/config/plan-features.config';
export { PLAN_FEATURE_MAP } from './lib/config/plan-features.config';
