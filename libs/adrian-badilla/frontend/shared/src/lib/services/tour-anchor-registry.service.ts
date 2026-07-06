import { ElementRef, Injectable } from '@angular/core';

/**
 * ─── TOUR ANCHOR REGISTRY ─────────────────────────────────────────────────────
 *
 * Central map from anchor-ID → live ElementRef.
 *
 * The TourAnchorDirective (`appTourAnchor`) registers/unregisters elements
 * here automatically. The TourOverlayComponent looks up elements to:
 *   • Measure their bounding rect (spotlight positioning)
 *   • Scroll them into view before measuring
 *   • Attach CDK/manual click listeners for click-triggered steps
 *
 * Kept in the SHARED library so the directive (used across dashboard + settings
 * + shared components) and the overlay (in settings) can both reach it without
 * creating a circular dependency.
 *
 * providedIn: 'root' — one singleton across the entire app, which is exactly
 * what we want: anchors registered in any lazy feature are visible globally.
 */
@Injectable({ providedIn: 'root' })
export class TourAnchorRegistryService {
  /** Internal registry — Map preserves insertion order and O(1) get/set/delete. */
  readonly #registry = new Map<string, ElementRef<HTMLElement>>();

  /**
   * Called by TourAnchorDirective when the directive initialises or its ID
   * input changes. Overwrites any previous registration for the same ID so
   * re-mounting a component (e.g. route navigation) always gives the fresh ref.
   */
  register(anchorId: string, el: ElementRef<HTMLElement>): void {
    this.#registry.set(anchorId, el);
  }

  /**
   * Called by TourAnchorDirective's effect cleanup when the host element is
   * destroyed or the anchor ID changes.
   */
  unregister(anchorId: string): void {
    this.#registry.delete(anchorId);
  }

  /**
   * Returns the live ElementRef for the given anchor, or undefined if the
   * element is not currently mounted.
   */
  getElement(anchorId: string): ElementRef<HTMLElement> | undefined {
    return this.#registry.get(anchorId);
  }

  /** Useful for diagnostics — returns all currently registered anchor IDs. */
  get registeredIds(): string[] {
    return Array.from(this.#registry.keys());
  }
}
