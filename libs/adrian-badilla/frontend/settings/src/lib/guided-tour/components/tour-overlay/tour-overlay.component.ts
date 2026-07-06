import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
} from '@angular/core';
import { NgStyle } from '@angular/common';
import { Router } from '@angular/router';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { settingsStoreDev } from '../../../store/settings.store';
import { TourAnchorRegistryService } from '@adrian-badilla/ui/shared';

/**
 * ─── TOUR OVERLAY COMPONENT ───────────────────────────────────────────────────
 *
 * The single visual host for the entire guided-tour experience.
 *
 * RESPONSIBILITIES (component — not store):
 *  1. DOM measurement — reads the live bounding rect of the current anchor and
 *     reports it back to the store via `updateSpotlightRect()`.
 *  2. Auto-scroll — scrolls the anchor element into view before measuring.
 *  3. Viewport tracking — listens to window scroll and resize events so the
 *     spotlight always tracks the element (CDK ViewportRuler is used for
 *     viewport dimensions; window events for re-measurement).
 *  4. Keyboard access — closes the tour on Escape.
 *
 * WHAT LIVES HERE vs. IN THE STORE:
 *  • Store  → step navigation, state, all derived/computed values.
 *  • Here   → DOM access, measurement, overlay lifecycle, keyboard events.
 *
 * RENDERING LAYERS (bottom → top):
 *  1. `.tour-backdrop`  — fixed-position element whose massive box-shadow
 *     creates the dark overlay around the spotlight. Smooth CSS transitions
 *     animate it between steps.
 *  2. `.tour-tooltip`   — coachmark card, positioned via computed styles that
 *     account for the spotlight rect and viewport bounds (mobile-first).
 *  3. Interactions      — Next / Back / Skip buttons inside the tooltip.
 *
 * CDK USAGE:
 *  • `ViewportRuler` (from @angular/cdk/scrolling) — provides reactive viewport
 *    dimensions for accurate tooltip positioning, avoiding direct window reads
 *    in computed signals. This is the primary CDK integration point.
 *  • `ScrollDispatcher` usage could be added in future for more granular
 *    scroll-context tracking.
 *  • For richer position strategies (e.g. in a popover/panel), the tooltip
 *    can be migrated to a CDK `FlexibleConnectedPositionStrategy` overlay.
 */
@Component({
  selector: 'lib-tour-overlay',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './tour-overlay.component.html',
  styleUrl: './tour-overlay.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.is-visible]': 'store.isOpen()',
    '[attr.aria-hidden]': '!store.isOpen()',
    role: 'region',
    'aria-label': 'Tour guiado',
  },
})
export class TourOverlayComponent {
  protected readonly store = inject(settingsStoreDev);
  readonly #registry = inject(TourAnchorRegistryService);
  readonly #destroyRef = inject(DestroyRef);
  readonly #viewportRuler = inject(ViewportRuler);
  readonly #router = inject(Router);

  // ─── Spotlight box (padded spotlight area) ──────────────────────────────────

  /**
   * Adds visual breathing room around the element's exact bounding rect.
   * All visual elements (backdrop, tooltip position) derive from this.
   */
  protected readonly spotlightBox = computed(() => {
    const rect = this.store.spotlightRect();
    if (!rect) return null;

    const PAD = 10;
    return {
      top: rect.top - PAD,
      left: rect.left - PAD,
      width: rect.width + PAD * 2,
      height: rect.height + PAD * 2,
    };
  });

  /** Four transparent rects that surround the spotlight — absorb all clicks outside it. */
  protected readonly blockers = computed(() => {
    const box = this.spotlightBox();
    const vp = this.#viewportRuler.getViewportSize();
    if (!box) return null;
    return [
      // top
      { top: 0, left: 0, width: vp.width, height: box.top },
      // bottom
      {
        top: box.top + box.height,
        left: 0,
        width: vp.width,
        height: vp.height - box.top - box.height,
      },
      // left
      { top: box.top, left: 0, width: box.left, height: box.height },
      // right
      {
        top: box.top,
        left: box.left + box.width,
        width: vp.width - box.left - box.width,
        height: box.height,
      },
    ];
  });

  // ─── Tooltip positioning ────────────────────────────────────────────────────

  /**
   * Computes the inline styles for the tooltip coachmark.
   *
   * Algorithm:
   *  1. Start with the step's `preferredPosition`.
   *  2. If 'auto' or preferred side doesn't have enough room, pick the
   *     side with the most available viewport space.
   *  3. Clamp horizontal/vertical position so the tooltip never clips
   *     outside the safe viewport area (16 px inset on all edges).
   *
   * CDK ViewportRuler gives us the current viewport size reactively,
   * avoiding direct `window.innerWidth/Height` reads in computed signals.
   */
  protected readonly tooltipStyle = computed((): Record<string, string> => {
    const rect = this.store.spotlightRect();
    const step = this.store.currentStep();
    if (!rect || !step) return { display: 'none' };

    const vp = this.#viewportRuler.getViewportSize();
    const TOOLTIP_W = Math.min(308, vp.width - 32);
    const GAP = 18;
    const PAD = 16;

    const pos = this.#resolvePosition(
      step.preferredPosition ?? 'auto',
      rect,
      vp,
      GAP
    );
    return this.#buildPositionStyles(pos, rect, vp, TOOLTIP_W, GAP, PAD);
  });

  /** Resolves 'auto' and applies fallback if preferred side has insufficient space. */
  #resolvePosition(
    pref: string,
    rect: NonNullable<ReturnType<typeof this.store.spotlightRect>>,
    vp: { width: number; height: number },
    gap: number
  ): string {
    const spaces = {
      bottom: vp.height - (rect.top + rect.height) - gap,
      top: rect.top - gap,
      right: vp.width - (rect.left + rect.width) - gap,
      left: rect.left - gap,
    };
    const MIN = 120;

    const best = (): string => {
      const max = Math.max(...Object.values(spaces));
      return (
        Object.keys(spaces).find(
          (k) => spaces[k as keyof typeof spaces] === max
        ) ?? 'bottom'
      );
    };

    const pos = pref === 'auto' ? best() : pref;
    const opposite: Record<string, string> = {
      bottom: 'top',
      top: 'bottom',
      left: 'right',
      right: 'left',
    };

    const needsFallback = spaces[pos as keyof typeof spaces] < MIN;
    const fallback = opposite[pos];
    return needsFallback &&
      fallback &&
      spaces[fallback as keyof typeof spaces] >= MIN
      ? fallback
      : pos;
  }

  /** Builds the style object for the tooltip given a resolved position. */
  #buildPositionStyles(
    pos: string,
    rect: NonNullable<ReturnType<typeof this.store.spotlightRect>>,
    vp: { width: number; height: number },
    w: number,
    gap: number,
    pad: number
  ): Record<string, string> {
    const styles: Record<string, string> = { width: `${w}px` };
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const TH = 200; // approximate tooltip height for vertical clamping

    const clampLeft = (x: number) =>
      `${Math.max(pad, Math.min(vp.width - w - pad, x))}px`;
    const clampTop = (y: number) =>
      `${Math.max(pad, Math.min(vp.height - TH - pad, y))}px`;

    switch (pos) {
      case 'bottom':
        styles['top'] = `${rect.top + rect.height + gap}px`;
        styles['left'] = clampLeft(cx - w / 2);
        break;
      case 'top':
        styles['bottom'] = `${vp.height - rect.top + gap}px`;
        styles['left'] = clampLeft(cx - w / 2);
        break;
      case 'left':
        styles['top'] = clampTop(cy - TH / 2);
        styles['left'] = `${Math.max(pad, rect.left - w - gap)}px`;
        break;
      case 'right':
        styles['top'] = clampTop(cy - TH / 2);
        styles['left'] = `${Math.min(
          vp.width - w - pad,
          rect.left + rect.width + gap
        )}px`;
        break;
    }
    return styles;
  }

  // ─── Progress dots ──────────────────────────────────────────────────────────

  protected readonly progressDots = computed(() => {
    const total = this.store.totalSteps();
    const current = this.store.stepProgress().current - 1; // 0-based
    return Array.from({ length: total }, (_, i) => i === current);
  });

  // ─── Reactive effects + event listeners ────────────────────────────────────
  //
  // All side-effect initializers are grouped into two IIFEs that return void.
  // This matches the pattern in NutritionChatComponent and avoids false-positive
  // "no-unused-vars" lint warnings on private EffectRef fields.

  /**
   * Effect group: DOM measurement and spotlight tracking.
   * Returns the DestroyRef cleanup canceller (same pattern as NutritionChatComponent)
   * so the field has a callable `() => void` type, avoiding lint false-positives.
   */
  // eslint-disable-next-line no-unused-private-class-members
  readonly #_sideEffects = (() => {
    // ① Measure + scroll whenever the active anchor changes
    effect(() => {
      const anchorId = this.store.activeAnchorId();
      const isOpen = this.store.isOpen();
      const route = this.store.currentStep()?.route;

      if (!isOpen || !anchorId) {
        this.store.updateSpotlightRect(null);
        return;
      }
      requestAnimationFrame(() => this.#scrollAndMeasure(anchorId, route));
    });

    // ② Click-trigger: auto-advance on 'click' steps when user taps the anchor
    effect((onCleanup) => {
      const step = this.store.currentStep();
      if (!step || !this.store.isOpen() || step.trigger !== 'click') return;

      const el = this.#registry.getElement(step.anchorId)?.nativeElement;
      if (!el) return;

      const handler = (): void => this.store.nextStep();
      el.addEventListener('click', handler, { once: true });
      onCleanup(() => el.removeEventListener('click', handler));
    });

    // ③ Escape key closes the tour
    const escHandler = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && this.store.isOpen()) this.store.closeTour();
    };
    document.addEventListener('keydown', escHandler);

    // ④ Re-measure on scroll/resize
    const remeasure = (): void => {
      const anchorId = this.store.activeAnchorId();
      if (anchorId && this.store.isOpen()) this.#measure(anchorId);
    };
    window.addEventListener('scroll', remeasure, {
      passive: true,
      capture: true,
    });
    window.addEventListener('resize', remeasure, { passive: true });

    // Return the DestroyRef deregister fn — gives this field the type
    // `() => void` rather than `void` (matches NutritionChatComponent pattern).
    return this.#destroyRef.onDestroy(() => {
      document.removeEventListener('keydown', escHandler);
      window.removeEventListener('scroll', remeasure, { capture: true });
      window.removeEventListener('resize', remeasure);
    });
  })();

  // ─── Private helpers ────────────────────────────────────────────────────────

  #scrollAndMeasure(anchorId: string, route?: string, attempt = 0): void {
    // On a fresh step, hide the backdrop immediately so it never slides from
    // the previous anchor to the new one (e.g. hamburger → sidenav nav-item).
    if (attempt === 0) {
      this.store.updateSpotlightRect(null);
    }

    const el = this.#registry.getElement(anchorId)?.nativeElement as
      | HTMLElement
      | undefined;

    if (!el) {
      if (route && !this.#router.url.startsWith(route)) {
        this.#router.navigateByUrl(route).then(() => {
          setTimeout(() => this.#scrollAndMeasure(anchorId, route, 0), 300);
        });
      } else if (attempt < 12) {
        setTimeout(
          () => this.#scrollAndMeasure(anchorId, route, attempt + 1),
          100
        );
      }
      return;
    }

    // Element is in the registry but may still be off-screen (e.g. inside a
    // sidenav that is still animating open). Retry until it has a real rect.
    const rect = el.getBoundingClientRect();
    const offscreen =
      rect.width === 0 ||
      rect.height === 0 ||
      rect.right < 0 ||
      rect.bottom < 0;
    if (offscreen && attempt < 12) {
      setTimeout(
        () => this.#scrollAndMeasure(anchorId, route, attempt + 1),
        100
      );
      return;
    }

    el.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    });
    setTimeout(() => this.#measure(anchorId), 420);
  }

  #measure(anchorId: string): void {
    const el = this.#registry.getElement(anchorId)?.nativeElement;
    if (!el) return;

    const { top, left, width, height } = el.getBoundingClientRect();
    this.store.updateSpotlightRect({ top, left, width, height });
  }

  // ─── Template actions ────────────────────────────────────────────────────────

  protected readonly onNext = (): void => {
    const step = this.store.currentStep();

    // ── Special case: meal-dropdown step ──────────────────────────────────────
    // Step 7 requires the dropdown to be open so step 8's anchor is in the DOM.
    // - If dropdown is already open (meal-dropdown-content in registry) → advance.
    // - If closed → click the card to open it; the opening animation registers the
    //   anchor, then we advance after a short render delay.
    // We do NOT use el.click() for any other click-trigger step so that revisiting
    // a step via "Anterior" never toggles DOM state unexpectedly.
    if (step?.anchorId === 'meal-dropdown') {
      const contentVisible = !!this.#registry.getElement(
        'meal-dropdown-content'
      );
      if (!contentVisible) {
        const triggerEl = this.#registry.getElement('meal-dropdown')
          ?.nativeElement as HTMLElement | undefined;
        if (triggerEl) {
          triggerEl.click(); // opens the dropdown
          setTimeout(() => this.store.nextStep(), 200); // wait for @if to render
          return;
        }
      }
      // Dropdown already open — advance without side effects.
      this.store.nextStep();
      return;
    }

    // For all other steps (including click-trigger ones): advance directly.
    // Physical clicks on click-trigger anchors are still handled by the
    // click-listener effect, which auto-advances independently.
    this.store.nextStep();
  };

  protected readonly onBack = (): void => {
    const step = this.store.currentStep();

    // When going back FROM meal-dropdown-content, close the dropdown first
    // so that step 7 (meal-dropdown) shows the card in its collapsed state
    // and the instruction "tap to expand" is visually coherent.
    if (step?.anchorId === 'meal-dropdown-content') {
      const triggerEl = this.#registry.getElement('meal-dropdown')
        ?.nativeElement as HTMLElement | undefined;
      if (triggerEl) triggerEl.click(); // closes the dropdown
    }

    this.store.previousStep();
  };

  protected readonly onSkip = (): void => this.store.closeTour();
}
