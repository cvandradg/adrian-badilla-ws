import {
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  effect,
} from '@angular/core';
import { TourAnchorRegistryService } from '../services/tour-anchor-registry.service';

/**
 * ─── TOUR ANCHOR DIRECTIVE ────────────────────────────────────────────────────
 *
 * Marks any DOM element (or component host) as a named anchor point for the
 * guided-tour system. Usage:
 *
 *   <button appTourAnchor="hamburger-menu">
 *   <lib-day-sidebar appTourAnchor="day-timeline" />
 *   <lib-shared-item-decision [appTourAnchor]="isFirst ? 'meal-card' : null" />
 *
 * Design decisions:
 *  • `input<string | null>` — passing null skips registration (convenient for
 *    conditional anchors inside @for loops without template duplication).
 *  • `effect(onCleanup)` — a single reactive registration that automatically
 *    unregisters on ID change AND on directive destroy. No lifecycle hooks,
 *    no manual subscriptions.
 *  • Lives in the SHARED library so it can be used in dashboard, settings, and
 *    shared components without circular imports.
 */
/* eslint-disable @angular-eslint/directive-selector */
@Directive({
  selector: '[appTourAnchor]',
  standalone: true,
})
/* eslint-enable @angular-eslint/directive-selector */
export class TourAnchorDirective {
  /**
   * The anchor ID this element should be registered under.
   * Pass null (or omit binding value) to opt-out of registration for
   * elements that are conditionally anchored (e.g. first item in a list).
   */
  readonly appTourAnchor = input<string | null>(null);

  readonly #el = inject(ElementRef<HTMLElement>);
  readonly #registry = inject(TourAnchorRegistryService);
  readonly #destroyRef = inject(DestroyRef);

  /**
   * Reactive registration effect.
   *
   * `onCleanup` fires before the effect re-runs (when `appTourAnchor` changes)
   * AND when the directive is destroyed — ensuring the registry never holds
   * stale ElementRefs.
   */
  // eslint-disable-next-line no-unused-private-class-members
  readonly #registration = effect((onCleanup) => {
    const id = this.appTourAnchor();

    if (!id) return; // null / empty string → opt-out

    this.#registry.register(id, this.#el);

    // Cleanup: unregister when ID changes or the directive is destroyed.
    onCleanup(() => this.#registry.unregister(id));

    // Fallback via DestroyRef for the case where the effect is never re-run
    // before host destruction (Angular guarantees effect cleanup, but this
    // makes intent explicit for future maintainers).
    this.#destroyRef.onDestroy(() => this.#registry.unregister(id));
  });
}
