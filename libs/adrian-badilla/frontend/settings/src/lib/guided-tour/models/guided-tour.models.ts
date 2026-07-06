/**
 * ─── GUIDED TOUR — DOMAIN MODELS ──────────────────────────────────────────────
 *
 * All types live here so the store, overlay, and directive share a single
 * source of truth. No circular dependencies — no framework imports.
 *
 * Design notes:
 *  • readonly everywhere — tour definitions are immutable at runtime.
 *  • "trigger" lets individual steps auto-advance when the user naturally
 *    interacts with the highlighted element ('click'), avoiding redundant
 *    "Next" presses for action-oriented steps.
 *  • TourPersistenceRecord is the future-ready contract for storing
 *    "hasSeenTour" / "tourVersion" in Firestore or localStorage.
 */

// ─── Position ─────────────────────────────────────────────────────────────────

/** Preferred tooltip placement relative to the spotlighted element. */
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'auto';

// ─── Step ─────────────────────────────────────────────────────────────────────

/**
 * Controls how the tour advances past a step.
 *  'manual' — user taps Next.
 *  'click'  — the tour auto-advances the moment the user clicks the anchor
 *             element (great for menu-open steps where the action IS the cue).
 */
export type TourStepTrigger = 'manual' | 'click';

export interface TourStep {
  /** Unique ID within its tour — used for analytics / persistence. */
  readonly id: string;

  /**
   * Must match the value passed to `appTourAnchor="<anchorId>"`.
   * The anchor directive registers the live ElementRef in TourAnchorRegistry
   * so the overlay can spotlight it without querySelector.
   */
  readonly anchorId: string;

  /** Short headline shown in the coachmark card. */
  readonly title: string;

  /** Full explanatory copy for the coachmark body. */
  readonly content: string;

  /**
   * How the tour moves past this step.
   * Defaults to 'manual' (Next button required).
   */
  readonly trigger: TourStepTrigger;

  /**
   * Preferred tooltip side relative to the spotlight.
   * 'auto' lets the overlay pick the side with the most available space.
   */
  readonly preferredPosition?: TooltipPosition;

  /**
   * Optional Angular route path the overlay will navigate to before
   * spotlighting this step's anchor (e.g. '/settings').
   *
   * Use this for steps whose anchor element lives on a different page/route
   * than the one the tour started from. The overlay automatically calls
   * `Router.navigateByUrl(route)` when the anchor is not registered in the
   * registry, then re-measures after the lazy route has rendered.
   *
   * Leave undefined for steps that share the same page as the previous step.
   */
  readonly route?: string;
}

// ─── Tour ─────────────────────────────────────────────────────────────────────

export interface TourDefinition {
  /** Unique identifier — persisted in user records. */
  readonly id: string;

  /** Human-readable name for debugging / admin tooling. */
  readonly name: string;

  /**
   * Semver-style integer. Bump when steps change substantially so users
   * who already completed an older version see the tour again.
   */
  readonly version: number;

  readonly steps: readonly TourStep[];

  /**
   * When true, the store will auto-start this tour for users who have
   * never seen it. Set to false during development/manual testing.
   */
  readonly autoStart?: boolean;
}

// ─── Spotlight ────────────────────────────────────────────────────────────────

/**
 * Live viewport-relative bounding box of the currently spotlighted element.
 * Measured by TourOverlayComponent after every step change, scroll, and resize.
 * Stored in the signal store so every computed (tooltip position, spotlight
 * ring size) derives from a single reactive source.
 */
export interface SpotlightRect {
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;
}

// ─── Persistence (future-ready contract) ──────────────────────────────────────

/**
 * Shape persisted per-user in Firestore / localStorage.
 * Not yet written to storage — included so the store signature is stable
 * when persistence is wired up.
 */
export interface TourPersistenceRecord {
  readonly tourId: string;
  readonly version: number;
  readonly hasCompleted: boolean;
  readonly completedAt: number | null;
}
