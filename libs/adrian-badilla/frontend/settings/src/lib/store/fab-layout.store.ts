import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';

// ── Constants ────────────────────────────────────────────────────────────────
/** Minimum vertical gap (px) between the tracker top edge and the lowest FAB. */
const FAB_GAP_ABOVE_TRACKER = 8;

/** Height of each FAB button in its default (desktop) size. */
export const FAB_HEIGHT = 44;

/** Height of each FAB button on narrow viewports (≤ 600 px). */
export const FAB_HEIGHT_MOBILE = 40;

/** Gap between stacked FABs (tour above chat). */
export const INTER_FAB_GAP = 8;

// ── Store ────────────────────────────────────────────────────────────────────
/**
 * FabLayoutStore — single source of truth for FAB vertical positioning.
 *
 * `MacroProgressTrackerComponent` reports its rendered height here via
 * `setTrackerHeight()`. Every FAB consumes `fabBaseBottom` via
 * `[style.--fab-bottom-base]` and lets CSS add `env(safe-area-inset-bottom)`.
 *
 * Adding a new FAB in the future only requires:
 *   1. Inject `FabLayoutStore`.
 *   2. Bind `[style.--fab-bottom-base]="fabLayout.fabBaseBottom() + 'px'"`.
 *   3. In SCSS use `bottom: calc(var(--fab-bottom-base, 16px) + <stack-offset> + env(...))`.
 */
export const FabLayoutStore = signalStore(
  { providedIn: 'root' },
  withState({ trackerHeight: 0 }),
  withComputed(({ trackerHeight }) => ({
    /**
     * Pixel distance from the viewport bottom to the bottom edge of the
     * lowest FAB. Does NOT include `env(safe-area-inset-bottom)` — that is
     * appended purely in CSS so the browser handles it correctly.
     */
    fabBaseBottom: computed(() => trackerHeight() + FAB_GAP_ABOVE_TRACKER),
  })),
  withMethods((store) => ({
    /**
     * Called by `MacroProgressTrackerComponent` whenever its rendered height
     * changes (via `ResizeObserver`). Pass `0` when the component is destroyed.
     */
    setTrackerHeight(height: number): void {
      patchState(store, { trackerHeight: Math.ceil(height) });
    },
  }))
);
