import { computed } from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import type {
  SpotlightRect,
  TourDefinition,
  TourStep,
} from '../guided-tour/models/guided-tour.models';
import { DIET_ONBOARDING_TOUR } from '../guided-tour/tours/diet-onboarding.tour';

/**
 * ─── GUIDED TOUR STATE ────────────────────────────────────────────────────────
 *
 * All mutable tour state lives here. The signal store is the single source of
 * truth — components never hold tour state locally.
 *
 * `spotlightRect` is the only state that is "written back" by a component
 * (TourOverlayComponent), which measures the DOM after each step change and
 * reports the live bounding rect. Everything else flows from store → template.
 */
interface GuidedTourState {
  /** Whether the tour overlay is currently visible. */
  isOpen: boolean;

  /** ID of the currently active TourDefinition. Null when no tour is running. */
  activeTourId: string | null;

  /** Zero-based index of the current step within the active tour. */
  currentStepIndex: number;

  /**
   * All registered tour definitions.
   * Built-in tours are pre-loaded; feature modules may register additional
   * tours at runtime via `registerTour()` (future lazy-feature support).
   */
  tours: TourDefinition[];

  /**
   * Viewport-relative bounding rect of the currently spotlighted element.
   * Written by TourOverlayComponent after DOM measurement.
   * Null between steps (while the overlay re-measures the new anchor).
   */
  spotlightRect: SpotlightRect | null;
}

// ─── Helper — finds the active tour's steps without repeating the .find() ──────
const activeSteps = (
  tours: TourDefinition[],
  activeTourId: string | null
): readonly TourStep[] => tours.find((t) => t.id === activeTourId)?.steps ?? [];

// ─── Feature ──────────────────────────────────────────────────────────────────

/**
 * `withGuidedTour` — a self-contained signal store feature.
 *
 * Plugged into `settingsStoreDev` (the global settings store) so every
 * component that already injects the settings store gets tour capabilities
 * for free, without a separate provider.
 *
 * Architecture notes:
 *  • All navigation logic (start, next, previous, close) lives here.
 *  • `computed` drives every derivative value — zero redundant state.
 *  • `spotlightRect` is state (not computed) because it requires DOM access,
 *    which belongs to TourOverlayComponent, not the store.
 *  • Tour definitions are data, not logic — they live in
 *    guided-tour/tours/ and are imported here. New tours are added there.
 */
export function withGuidedTour() {
  return signalStoreFeature(
    withState<GuidedTourState>({
      isOpen: false,
      activeTourId: null,
      currentStepIndex: 0,
      tours: [DIET_ONBOARDING_TOUR],
      spotlightRect: null,
    }),

    withComputed((store) => ({
      /**
       * The full TourDefinition currently running, or null when idle.
       * Used by TourOverlayComponent for tour metadata (name, step count).
       */
      activeTour: computed(
        (): TourDefinition | null =>
          store.tours().find((t) => t.id === store.activeTourId()) ?? null
      ),

      /**
       * Current step definition — the single object the overlay reads for
       * title, content, anchorId, preferredPosition, and trigger.
       */
      currentStep: computed(
        (): TourStep | null =>
          activeSteps(store.tours(), store.activeTourId())[
            store.currentStepIndex()
          ] ?? null
      ),

      /** Anchor ID of the element to spotlight — drives TourOverlayComponent. */
      activeAnchorId: computed(
        (): string | null =>
          activeSteps(store.tours(), store.activeTourId())[
            store.currentStepIndex()
          ]?.anchorId ?? null
      ),

      /** Total step count of the active tour. */
      totalSteps: computed(
        (): number => activeSteps(store.tours(), store.activeTourId()).length
      ),

      /** Whether the user can navigate forward. */
      canGoNext: computed((): boolean => {
        const steps = activeSteps(store.tours(), store.activeTourId());
        return store.currentStepIndex() < steps.length - 1;
      }),

      /** Whether the user can navigate backward. */
      canGoBack: computed((): boolean => store.currentStepIndex() > 0),

      /** True when the current step is the last one. */
      isLastStep: computed((): boolean => {
        const steps = activeSteps(store.tours(), store.activeTourId());
        return (
          steps.length > 0 && store.currentStepIndex() === steps.length - 1
        );
      }),

      /**
       * Normalised 0-based step number for UI display (step X of Y).
       * Exposes [currentHuman, total] tuple to avoid multiple reads.
       */
      stepProgress: computed((): { current: number; total: number } => ({
        current: store.currentStepIndex() + 1,
        total: activeSteps(store.tours(), store.activeTourId()).length,
      })),
    })),

    withMethods((store) => ({
      /**
       * Start a tour by ID.
       * Omit `tourId` to start the first registered tour (onboarding default).
       * Safe to call at any time — resets step index and clears the rect.
       */
      startTour(tourId?: string): void {
        const id = tourId ?? store.tours()[0]?.id;
        if (!id) return;

        const tourExists = store.tours().some((t) => t.id === id);
        if (!tourExists) return;

        patchState(store, {
          isOpen: true,
          activeTourId: id,
          currentStepIndex: 0,
          spotlightRect: null,
        });
      },

      /**
       * Advance to the next step.
       * Automatically closes the tour when called on the last step,
       * so callers don't need to check `isLastStep` themselves.
       */
      nextStep(): void {
        const steps = activeSteps(store.tours(), store.activeTourId());
        const nextIndex = store.currentStepIndex() + 1;

        if (nextIndex >= steps.length) {
          // Tour complete — close and reset.
          patchState(store, {
            isOpen: false,
            activeTourId: null,
            currentStepIndex: 0,
            spotlightRect: null,
          });
          return;
        }

        patchState(store, {
          currentStepIndex: nextIndex,
          spotlightRect: null, // triggers re-measurement in TourOverlayComponent
        });
      },

      /** Go back one step. No-op if already at the first step. */
      previousStep(): void {
        if (store.currentStepIndex() <= 0) return;
        patchState(store, {
          currentStepIndex: store.currentStepIndex() - 1,
          spotlightRect: null,
        });
      },

      /** Close and fully reset the tour without completing it. */
      closeTour(): void {
        patchState(store, {
          isOpen: false,
          activeTourId: null,
          currentStepIndex: 0,
          spotlightRect: null,
        });
      },

      /**
       * Called by TourOverlayComponent after measuring the anchor element.
       * Kept as a store method so state changes stay inside the store
       * and TourOverlayComponent remains a "dumb" DOM bridge.
       */
      updateSpotlightRect(rect: SpotlightRect | null): void {
        patchState(store, { spotlightRect: rect });
      },

      /**
       * Register a tour at runtime — intended for feature modules that
       * lazily declare their own contextual tours.
       * Idempotent: duplicate IDs are silently ignored.
       */
      registerTour(tour: TourDefinition): void {
        if (store.tours().some((t) => t.id === tour.id)) return;
        patchState(store, { tours: [...store.tours(), tour] });
      },
    }))
  );
}
