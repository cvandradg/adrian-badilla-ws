import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { SharedItemTimelineComponent } from '../shared-item-timeline/shared-item-timeline.component';
import { ROUTINE_DAYS_MOCK } from '../../mocks/routines.mock';
import type { RoutineDay } from '../../adapters/decision-item.adapters';
import type { MealStatus } from '../../types/diet-decision.types';

@Component({
  selector: 'lib-routines-page',
  standalone: true,
  imports: [SharedItemTimelineComponent],
  templateUrl: './routines-page.component.html',
  styleUrl: './routines-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoutinesPageComponent {
  readonly days = signal<RoutineDay[]>(ROUTINE_DAYS_MOCK);
  readonly selectedDayId = signal(ROUTINE_DAYS_MOCK[0].id);

  readonly selectedDay = computed(() =>
    this.days().find((d) => d.id === this.selectedDayId())
  );

  readonly isTimelineComplete = computed(() =>
    this.selectedDay()?.routines.every((r) => r.status === 'completed') ?? false
  );

  /** Set of day IDs where every routine is completed — passed to DaySidebarComponent. */
  readonly completedDayIds = computed(
    () => new Set(this.days().filter((d) => this.isDayComplete(d)).map((d) => d.id))
  );

  selectDay(id: string): void {
    this.selectedDayId.set(id);
  }

  handleStatusChange(event: { id: string; status: MealStatus }): void {
    this.days.update((days) =>
      days.map((day) => ({
        ...day,
        routines: day.routines.map((r) =>
          r.id === event.id ? { ...r, status: event.status } : r
        ),
      }))
    );
  }

  openChat(id: string): void {
    console.log('Open chat for routine', id);
  }

  openDetails(id: string): void {
    console.log('Open details for routine', id);
  }

  isDayComplete(day: RoutineDay): boolean {
    return day.routines.length > 0 && day.routines.every((r) => r.status === 'completed');
  }

  /** Extracts the minimal DayBase fields for the timeline shell. */
  readonly routineDays = computed(() =>
    this.days().map(({ id, label, date }) => ({ id, label, date }))
  );
}
