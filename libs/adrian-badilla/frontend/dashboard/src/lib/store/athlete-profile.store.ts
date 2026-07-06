import { signalStore } from '@ngrx/signals';
import { withAthleteProfileFeature } from './with-athlete-profile.feature';

/**
 * athleteProfileStore
 *
 * Single source of truth for the athlete profile questionnaire.
 * Composed from `withAthleteProfileFeature` following the same pattern
 * used by `billingStore` and `aiStore`.
 *
 * ── Initialization ───────────────────────────────────────────────────────────
 * Call `inject(athleteProfileStore).loadAthleteProfile()` in `ProfilePageComponent.ngOnInit`
 * (or via effect). The store does NOT auto-load on construction to avoid
 * unnecessary Firestore reads on pages that don't need it.
 *
 * ── Firestore field ──────────────────────────────────────────────────────────
 * Data is stored in `users/{uid}.athleteProfile` — no new collection needed.
 *
 * ── AI readiness ─────────────────────────────────────────────────────────────
 * The stored data is intentionally structured for future AI Coach consumption:
 *   training / nutrition / health / lifestyle categories map directly to the
 *   AI context payload that will be added in a future sprint.
 */
export const athleteProfileStore = signalStore(
  { providedIn: 'root' },
  withAthleteProfileFeature()
);

export type AthleteProfileStore = InstanceType<typeof athleteProfileStore>;
