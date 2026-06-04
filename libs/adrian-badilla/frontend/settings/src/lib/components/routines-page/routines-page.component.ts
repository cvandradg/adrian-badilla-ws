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
import { ROUTINE_HISTORY_MOCK } from '../../mock/routine-history.mock';
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

  /** Load active routine once when auth is available and fetch hasn’t run yet. */
  readonly #loadEffect = effect(() => {
    const userId = (this.store as any)['_routineUserId']?.();
    const fetchDone = this.store.routineFetchDone();
    if (userId && !fetchDone) {
      this.store.loadActiveRoutine();
    }
  });

  // ─── Store signals (presentational bindings) ─────────────────────────────
  // Direct references — no computed wrapper needed for plain pass-throughs.

  readonly routineDayBases = this.store.routineDayBases;
  readonly selectedDayRoutines = this.store.selectedDayRoutines;
  readonly isSelectedDayComplete = this.store.isSelectedDayComplete;
  readonly completedRoutineDayIds = this.store.completedRoutineDayIds;

  /** Normalises undefined → '' so the template always gets a string. */
  readonly selectedRoutineDayId = computed(
    () => this.store.selectedRoutineDayId() ?? ''
  );

  /** True when the selected day has no exercises (rest day, e.g. Domingo). */
  readonly isRestDay = this.store.isSelectedDayRestDay;

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
  // Stop showing once fetch is done (covers users with no routine).
  readonly isLoadingRoutine = computed(
    () =>
      this.store.loadingRoutine() ||
      (!this.store.routineFetchDone() && !this.store.errorRoutine())
  );

  /** True when the fetch completed but no routine document exists for this user. */
  readonly hasNoRoutine = computed(() => this.store.noActiveRoutine());

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
