import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  signal,
  ElementRef,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { FabLayoutStore } from '../../store/fab-layout.store';
import { TourAnchorDirective } from '@adrian-badilla/ui/shared';

/**
 * ProgressTrackerShellComponent
 *
 * Shared shell for all progress tracker panels (diets, routines, …).
 * Owns: layout, progress bar, header, collapse state, caret, FabLayout sync.
 *
 * Uses ViewEncapsulation.None so its shared styles (.stat, .tracker__*, etc.)
 * apply to content projected from child components via ng-content slots.
 *
 * Slots:
 *   [header-badge]       – optional badge in expanded header (e.g. kcal badge for diets)
 *   [collapsed-summary]  – compact inline summary shown when collapsed
 *   [expanded-stats]     – stats row content (injected inside .tracker__stats wrapper)
 *   [extras]             – optional extra content below stats (e.g. PR chips)
 */
@Component({
  selector: 'lib-progress-tracker-shell',
  standalone: true,
  imports: [NgClass, TourAnchorDirective],
  templateUrl: './progress-tracker-shell.component.html',
  styleUrl: './progress-tracker-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // None: shell styles must reach projected content — all classes are prefixed
  // with .tracker__ or .stat__ to avoid polluting the global namespace.
  encapsulation: ViewEncapsulation.None,
})
export class ProgressTrackerShellComponent {
  readonly #fabLayout = inject(FabLayoutStore);
  readonly #el = inject(ElementRef<HTMLElement>);

  // ─── Required inputs ────────────────────────────────────────────────────────
  /** Text shown in the header label (e.g. "Progreso de dietas"). */
  readonly label = input.required<string>();
  /** PrimeNG icon class without the "pi " prefix (e.g. "pi-chart-line"). */
  readonly icon = input.required<string>();
  /** Whether all items are completed — drives `.tracker--complete` state. */
  readonly isComplete = input.required<boolean>();
  /** Fill width percentage for the progress bar (0–100). */
  readonly barWidth = input.required<number>();
  /** Display percentage shown next to the count (already rounded if needed). */
  readonly pct = input.required<number>();
  /** How many items are completed. */
  readonly completedCount = input.required<number>();
  /** Total item count shown as denominator in "X/Y". */
  readonly totalCount = input.required<number>();
  /** Motivation / status message shown at the bottom when expanded. */
  readonly message = input.required<string>();

  // ─── Optional inputs ────────────────────────────────────────────────────────
  readonly ariaLabel = input<string>('Progreso');
  /** Tour anchor ID applied to the section element (empty string = no anchor). */
  readonly tourAnchorId = input<string>('');

  // ─── Collapse state (owned by shell) ────────────────────────────────────────
  readonly collapsed = signal(false);
  readonly toggleCollapsed = (): void => this.collapsed.update((v) => !v);

  // ─── Derived ────────────────────────────────────────────────────────────────
  readonly pctColorClass = computed<string>(() => {
    if (this.isComplete()) return 'pct--done';
    if (this.pct() >= 50) return 'pct--mid';
    if (this.pct() > 0) return 'pct--low';
    return 'pct--zero';
  });

  // ─── FAB height sync ────────────────────────────────────────────────────────
  readonly #heightObserverEffect = effect((cleanup) => {
    const el = this.#el.nativeElement;
    const ro = new ResizeObserver((entries) => {
      const height =
        entries[0]?.borderBoxSize[0]?.blockSize ??
        entries[0]?.contentRect.height ??
        el.getBoundingClientRect().height;
      this.#fabLayout.setTrackerHeight(height);
    });
    ro.observe(el);
    cleanup(() => {
      ro.disconnect();
      this.#fabLayout.setTrackerHeight(0);
    });
  });
}
