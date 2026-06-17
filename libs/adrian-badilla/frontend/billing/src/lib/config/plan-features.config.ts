import type { SubscriptionPlan } from '../models/subscription.model';

// ─── Feature Names ────────────────────────────────────────────────────────────

/**
 * Union of all gated feature keys.
 * Add new feature names here when expanding the product.
 */
export type FeatureName =
  | 'ai'
  | 'advancedAnalytics'
  | 'exportPdf'
  | 'unlimitedRoutines'
  | 'unlimitedDiets';

// ─── Plan → Feature Map ───────────────────────────────────────────────────────

/**
 * Declarative map of which features each plan unlocks.
 * The billing store's `hasFeature()` computed derives access from this map.
 * To add a new plan tier, add an entry here — zero store changes required.
 */
export const PLAN_FEATURE_MAP: Readonly<
  Record<SubscriptionPlan, ReadonlySet<FeatureName>>
> = {
  free: new Set<FeatureName>([]),
  premium: new Set<FeatureName>([
    'ai',
    'advancedAnalytics',
    'exportPdf',
    'unlimitedRoutines',
    'unlimitedDiets',
  ]),
} as const;
