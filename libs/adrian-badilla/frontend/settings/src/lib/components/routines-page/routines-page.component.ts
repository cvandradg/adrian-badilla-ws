import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, user } from '@angular/fire/auth';
import { SharedItemTimelineComponent } from '../shared-item-timeline/shared-item-timeline.component';
import { RoutineProgressTrackerComponent } from '../routine-progress-tracker/routine-progress-tracker.component';
import {
  SectionTabsComponent,
  type SectionTab,
} from '../section-tabs/section-tabs.component';
import { SectionHistoryComponent } from '../section-history/section-history.component';
import { settingsStoreDev } from '../../store/settings.store';
import { calculateRoutineProgressMetrics } from '../../store/with-routine-tracker.feature';
import type { MealStatus } from '../../types/diet-decision.types';
import { ROUTINE_HISTORY_MOCK } from '../../mocks/routine-history.mock';
import type { HistoryEntry } from '../../types/section-history.types';
import { SkeletonLoaderComponent } from '@adrian-badilla/ui/shared';

@Component({
  selector: 'lib-routines-page',
  standalone: true,
  imports: [
    SharedItemTimelineComponent,
    RoutineProgressTrackerComponent,
    SectionTabsComponent,
    SectionHistoryComponent,
    SkeletonLoaderComponent,
  ],
  templateUrl: './routines-page.component.html',
  styleUrl: './routines-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoutinesPageComponent {
  private readonly store = inject(settingsStoreDev);

  // ─── Auth trigger ────────────────────────────────────────────────────────
  private readonly _auth = inject(Auth);
  private readonly _authUser = toSignal(user(this._auth), {
    initialValue: null,
  });

  constructor() {
    // Trigger load once, independent of which template branch is rendered.
    // Using effect() instead of computed() avoids the skeleton → no-render → no-load deadlock.
    effect(() => {
      // TODO: Restore to: const authUser = this._authUser();
      const authUser = { uid: 'T7eoekKP2YarbxJvIMbo' }; // Hardcoded for testing
      if (
        authUser?.uid &&
        !this.store.routineDays().length &&
        !this.store.loadingRoutine()
      ) {
        this.store.loadActiveRoutine();
      }
    });
  }

  // Pure computed — no side effects.
  readonly ensureRoutineLoaded = computed(() =>
    this.store.selectedDayRoutines()
  );

  // ─── Store signals (presentational bindings) ─────────────────────────────

  readonly routineDayBases = computed(() => this.store.routineDayBases());
  readonly selectedRoutineDayId = computed(
    () => this.store.selectedRoutineDayId() ?? ''
  );
  readonly selectedDayRoutines = computed(() =>
    this.store.selectedDayRoutines()
  );
  readonly isSelectedDayComplete = computed(() =>
    this.store.isSelectedDayComplete()
  );
  readonly completedRoutineDayIds = computed(() =>
    this.store.completedRoutineDayIds()
  );

  /** True when the selected day has no exercises (rest day, e.g. Domingo). */
  readonly isRestDay = computed(() => this.store.isSelectedDayRestDay());

  /** Label of the selected day (e.g. "Domingo") — used in the rest-day card. */
  readonly selectedDayLabel = computed(() => {
    const id = this.selectedRoutineDayId();
    return this.routineDayBases().find((d) => d.id === id)?.label ?? '';
  });

  // ─── Progress tracker metrics ─────────────────────────────────────────────

  /**
   * Derives live progress metrics from the store's routine days.
   * `withRoutineTracker` pure functions receive the store data and recalculate
   * automatically whenever a status changes.
   */
  readonly progressMetrics = computed(() =>
    calculateRoutineProgressMetrics(
      this.store.routineDays(),
      this.store.selectedRoutineDayId() ?? ''
    )
  );

  // ─── Tab navigation ─────────────────────────────────────────────────────

  readonly activeTab = signal('rutinas');

  readonly tabs: SectionTab[] = [
    { value: 'rutinas', label: 'Rutinas', icon: ['fas', 'heart-pulse'] },
    { value: 'historial', label: 'Historial', icon: ['fas', 'rotate-back'] },
    { value: 'config', label: 'Configuración', icon: ['fas', 'bars'] },
  ];

  readonly routineHistoryEntries: HistoryEntry[] = ROUTINE_HISTORY_MOCK;

  // Show skeleton while actively loading OR while days haven't arrived yet
  // (covers the first tick before loadActiveRoutine() sets loadingRoutine=true).
  // Stop showing it once an error is set (so error state can surface instead).
  readonly isLoadingRoutine = computed(
    () =>
      this.store.loadingRoutine() ||
      (!this.store.errorRoutine() && this.routineDayBases().length === 0)
  );

  setActiveTab(value: string): void {
    this.activeTab.set(value);
  }

  // ─── Event handlers (delegate to store) ─────────────────────────────────

  selectDay(dayId: string): void {
    this.store.selectRoutineDay(dayId);
  }

  handleStatusChange(event: { id: string; status: MealStatus }): void {
    this.store.updateRoutineExerciseStatus(event);
  }

  openChat(_id: string): void {
    // TODO: Implement routine chat
  }

  openDetails(_id: string): void {
    // TODO: Implement routine details
  }
}
