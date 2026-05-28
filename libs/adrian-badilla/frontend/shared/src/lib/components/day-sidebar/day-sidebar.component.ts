import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import type { DayBase } from '../../types/day-base.types';

@Component({
  selector: 'lib-day-sidebar',
  imports: [],
  templateUrl: './day-sidebar.component.html',
  styleUrl: './day-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DaySidebarComponent {
  /** List of days to display. */
  readonly days = input.required<DayBase[]>();

  /** ID of the currently active day. */
  readonly selectedDayId = input.required<string>();

  /**
   * Optional set of day IDs that are fully complete.
   * The parent computes this — the sidebar stays domain-agnostic.
   */
  readonly completedDayIds = input<ReadonlySet<string>>(new Set());

  /** Emits the ID of the day the user clicked. */
  readonly daySelected = output<string>();

  // ─── DOM ref ─────────────────────────────────────────────────────────────
  private readonly scrollElRef =
    viewChild.required<ElementRef<HTMLDivElement>>('scrollEl');
  private readonly destroyRef = inject(DestroyRef);

  // ─── Scroll state signals ─────────────────────────────────────────────────
  private readonly _scrollLeft = signal(0);
  private readonly _scrollWidth = signal(0);
  private readonly _clientWidth = signal(0);

  readonly scrollPosition = computed(() => this._scrollLeft());
  readonly canScrollLeft = computed(() => this._scrollLeft() > 2);
  readonly canScrollRight = computed(
    () => this._scrollLeft() < this._scrollWidth() - this._clientWidth() - 2
  );
  readonly isAtStart = computed(() => !this.canScrollLeft());
  readonly isAtEnd = computed(() => !this.canScrollRight());

  /** Wire scroll sync after first render — no constructor needed. */
  readonly #initScroll = afterNextRender(() => {
    this.syncScrollState();

    const ro = new ResizeObserver(() => this.syncScrollState());
    ro.observe(this.scrollElRef().nativeElement);
    this.destroyRef.onDestroy(() => ro.disconnect());
  });

  isComplete(dayId: string): boolean {
    return this.completedDayIds().has(dayId);
  }

  onScroll(): void {
    this.syncScrollState();
  }

  scrollToPrev(): void {
    if (!this.canScrollLeft()) return;
    const el = this.scrollElRef().nativeElement;
    el.scrollTo({
      left: Math.max(0, el.scrollLeft - el.clientWidth * 0.8),
      behavior: 'smooth',
    });
  }

  scrollToNext(): void {
    if (!this.canScrollRight()) return;
    const el = this.scrollElRef().nativeElement;
    el.scrollTo({
      left: Math.min(
        el.scrollWidth - el.clientWidth,
        el.scrollLeft + el.clientWidth * 0.8
      ),
      behavior: 'smooth',
    });
  }

  private syncScrollState(): void {
    const el = this.scrollElRef().nativeElement;
    this._scrollLeft.set(el.scrollLeft);
    this._scrollWidth.set(el.scrollWidth);
    this._clientWidth.set(el.clientWidth);
  }
}
