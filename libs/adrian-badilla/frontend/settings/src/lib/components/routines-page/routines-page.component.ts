import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, user } from '@angular/fire/auth';
import { SharedItemTimelineComponent } from '../shared-item-timeline/shared-item-timeline.component';
import { RoutineProgressTrackerComponent } from '../routine-progress-tracker/routine-progress-tracker.component';
import { settingsStoreDev } from '../../store/settings.store';
import { calculateRoutineProgressMetrics } from '../../store/with-routine-tracker.feature';
import type { MealStatus } from '../../types/diet-decision.types';

@Component({
  selector: 'lib-routines-page',
  standalone: true,
  imports: [SharedItemTimelineComponent, RoutineProgressTrackerComponent],
  templateUrl: './routines-page.component.html',
  styleUrl: './routines-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoutinesPageComponent {
  private readonly store = inject(settingsStoreDev);

  // ─── Auth trigger (same pattern as AdrianBadillaDietsComponent) ─────────
  private readonly _auth = inject(Auth);
  private readonly _authUser = toSignal(user(this._auth), { initialValue: null });

  /**
   * Triggers routine auto-load exactly once when the user is authenticated.
   * Uses computed() as a reactive trigger — no ngOnInit, no effects.
   *
   * The return value (`selectedDayRoutines`) keeps this computed alive
   * so Angular doesn't prune it as unused.
   */
  readonly ensureRoutineLoaded = computed(() => {
    // 🔧 Development: Using hardcoded userId for testing. Remove once Firebase Auth is properly configured.
    const authUser = { uid: 'T7eoekKP2YarbxJvIMbo' };
    // eslint-disable-next-line no-commented-code
    // const authUser = this._authUser(); // Production: Use authenticated user from Firebase

    if (authUser?.uid && !this.store.routineDays().length) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.store.loadActiveRoutine();
    }

    return this.store.selectedDayRoutines();
  });

  // ─── Store signals (presentational bindings) ─────────────────────────────

  readonly loadingRoutine = computed(() => this.store.loadingRoutine());
  readonly errorRoutine   = computed(() => this.store.errorRoutine());

  readonly routineDayBases       = computed(() => this.store.routineDayBases());
  readonly selectedRoutineDayId  = computed(() => this.store.selectedRoutineDayId() ?? '');
  readonly selectedDayRoutines   = computed(() => this.store.selectedDayRoutines());
  readonly isSelectedDayComplete = computed(() => this.store.isSelectedDayComplete());
  readonly completedRoutineDayIds = computed(() => this.store.completedRoutineDayIds());

  // ─── Progress tracker metrics ─────────────────────────────────────────────

  /**
   * Derives live progress metrics from the store's routine days.
   * `withRoutineTracker` pure functions receive the store data and recalculate
   * automatically whenever a status changes.
   */
  readonly progressMetrics = computed(() =>
    calculateRoutineProgressMetrics(
      this.store.routineDays(),
      this.store.selectedRoutineDayId() ?? '',
    )
  );

  // ─── Event handlers (delegate to store) ─────────────────────────────────

  selectDay(dayId: string): void {
    this.store.selectRoutineDay(dayId);
  }

  handleStatusChange(event: { id: string; status: MealStatus }): void {
    this.store.updateRoutineExerciseStatus(event);
  }

  openChat(id: string): void {
    console.log('Open chat for routine', id);
  }

  openDetails(id: string): void {
    console.log('Open details for routine', id);
  }
}

