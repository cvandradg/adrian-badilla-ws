import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { Timeline } from 'primeng/timeline';
import type { RoutineDay } from '../../types/routine.types';

const ROUTINE_LIST_SCROLL_STEP = 156;

@Component({
  selector: 'lib-routine-master-detail',
  imports: [
    FloatLabelModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    RippleModule,
    Timeline,
    FontAwesomeModule,
  ],
  templateUrl: './routine-master-detail.component.html',
  styleUrl: './routine-master-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoutineMasterDetailComponent {
  private readonly destroyRef = inject(DestroyRef);
  private resizeObserver?: ResizeObserver;

  readonly routineDays = input.required<readonly RoutineDay[]>();
  readonly searchQuery = input('');
  readonly searchQueryChange = output<string>();

  readonly selectedRoutineId = signal<string | null>(null);
  readonly routineListScroll = viewChild<ElementRef<HTMLDivElement>>('routineListScroll');
  readonly canScrollUp = signal(false);
  readonly canScrollDown = signal(false);

  readonly hasSearchQuery = computed(() => Boolean(this.searchQuery().trim()));

  readonly activeRoutineId = computed(() => {
    const routineDays = this.routineDays();
    const selectedRoutineId = this.selectedRoutineId();

    if (
      selectedRoutineId &&
      routineDays.some((routineDay) => routineDay.id === selectedRoutineId)
    ) {
      return selectedRoutineId;
    }

    return routineDays[0]?.id ?? null;
  });

  readonly activeRoutineDay = computed(() => {
    const activeRoutineId = this.activeRoutineId();
    if (!activeRoutineId) return null;

    return (
      this.routineDays().find((routineDay) => routineDay.id === activeRoutineId) ??
      null
    );
  });

  readonly activeItemIndex = computed(() => {
    const activeRoutineId = this.activeRoutineId();
    if (!activeRoutineId) return -1;

    return this.routineDays().findIndex(
      (routineDay) => routineDay.id === activeRoutineId,
    );
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.resizeObserver?.disconnect();
    });

    afterNextRender(() => {
      this.syncScrollMetrics();
      this.connectResizeObserver();
    });
  }

  updateSearchQuery(value: string): void {
    this.searchQueryChange.emit(value);
    queueMicrotask(() => this.syncScrollMetrics());
  }

  clearSearchQuery(): void {
    this.searchQueryChange.emit('');
    queueMicrotask(() => this.syncScrollMetrics());
  }

  selectRoutine(routineId: string): void {
    if (this.activeRoutineId() === routineId) return;
    this.selectedRoutineId.set(routineId);
  }

  scrollUp(): void {
    const scrollElement = this.routineListScroll()?.nativeElement;
    if (!scrollElement || !this.canScrollUp()) return;

    scrollElement.scrollBy({
      top: -ROUTINE_LIST_SCROLL_STEP,
      behavior: 'smooth',
    });
  }

  scrollDown(): void {
    const scrollElement = this.routineListScroll()?.nativeElement;
    if (!scrollElement || !this.canScrollDown()) return;

    scrollElement.scrollBy({
      top: ROUTINE_LIST_SCROLL_STEP,
      behavior: 'smooth',
    });
  }

  syncScrollMetrics(): void {
    const scrollElement = this.routineListScroll()?.nativeElement;
    if (!scrollElement) return;

    this.canScrollUp.set(scrollElement.scrollTop > 0);
    this.canScrollDown.set(
      scrollElement.scrollTop + scrollElement.clientHeight <
        scrollElement.scrollHeight - 1,
    );
  }

  private connectResizeObserver(): void {
    if (typeof ResizeObserver === 'undefined') return;

    const scrollElement = this.routineListScroll()?.nativeElement;
    if (!scrollElement) return;

    this.resizeObserver?.disconnect();
    this.resizeObserver = new ResizeObserver(() => {
      this.syncScrollMetrics();
    });

    this.resizeObserver.observe(scrollElement);

    const listElement = scrollElement.firstElementChild;
    if (listElement instanceof HTMLElement) this.resizeObserver.observe(listElement);
  }
}
