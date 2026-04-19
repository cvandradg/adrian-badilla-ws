import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TabsModule } from 'primeng/tabs';
import { buildRoutineDays } from './data/routine-days.mock';
import { RoutinesBreakdownComponent } from './components/routines-breakdown/routines-breakdown.component';
import { RoutinesInfoColumnComponent } from './components/routines-info-column/routines-info-column.component';
import type { RoutineSummary } from './types/routine.types';
import {
  endOfDay,
  endOfWeek,
  normalizeSearchValue,
  startOfDay,
  startOfWeek,
} from './utils/routine.utils';

type TopTab = {
  value: string;
  label: string;
  icon: [string, string];
};

@Component({
  selector: 'lib-routines',
  imports: [
    TabsModule,
    FontAwesomeModule,
    RoutinesInfoColumnComponent,
    RoutinesBreakdownComponent,
  ],
  templateUrl: './routines.component.html',
  styleUrl: './routines.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoutinesComponent {
  readonly topTabs: TopTab[] = [
    {
      value: 'rutinas',
      label: 'Rutinas',
      icon: ['fas', 'arrow-rotate-right'],
    },
    {
      value: 'modificaciones-de-rutinas',
      label: 'Modificaciones de Rutinas',
      icon: ['fas', 'list-check'],
    },
  ];

  readonly routineDays = buildRoutineDays(new Date());
  readonly currentWeekTitle = `Semana del ${this.routineDays[0]?.dateLabel ?? ''}`;
  readonly maxRoutineDate = endOfWeek(new Date());
  readonly routineStartDate = signal(startOfWeek(new Date()));
  readonly routineEndDate = signal(endOfWeek(new Date()));
  readonly searchQuery = signal('');

  readonly filteredRoutineDays = computed(() => {
    const query = normalizeSearchValue(this.searchQuery());
    const startDate = startOfDay(this.routineStartDate());
    const endDate = endOfDay(this.routineEndDate());

    return this.routineDays.filter((routineDay) => {
      const withinDateRange =
        routineDay.date.getTime() >= startDate.getTime() &&
        routineDay.date.getTime() <= endDate.getTime();

      if (!withinDateRange) return false;
      if (!query) return true;

      const searchSource = normalizeSearchValue(
        [
          routineDay.name,
          routineDay.description,
          routineDay.summary,
          routineDay.goal,
          ...routineDay.blocks.flatMap((block) => [
            block.title,
            block.subtitle,
            ...block.metaChips,
          ]),
        ].join(' '),
      );

      return searchSource.includes(query);
    });
  });

  readonly weeklySummary = computed<RoutineSummary>(() => {
    const filteredRoutineDays = this.filteredRoutineDays();

    return filteredRoutineDays.reduce<RoutineSummary>(
      (summary, routineDay) => ({
        dayCount: summary.dayCount + 1,
        totalBlocks: summary.totalBlocks + routineDay.sessionCount,
        totalExercises: summary.totalExercises + routineDay.exerciseCount,
        totalMinutes: summary.totalMinutes + routineDay.totalMinutes,
        modifiedDays: summary.modifiedDays + (routineDay.isModified ? 1 : 0),
      }),
      {
        dayCount: 0,
        totalBlocks: 0,
        totalExercises: 0,
        totalMinutes: 0,
        modifiedDays: 0,
      },
    );
  });

  updateSearchQuery(value: string): void {
    this.searchQuery.set(value);
  }

  onStartDateSelect(date: Date): void {
    const nextStartDate = startOfDay(date);
    const currentEndDate = this.routineEndDate();

    this.routineStartDate.set(nextStartDate);

    if (nextStartDate.getTime() > currentEndDate.getTime()) {
      this.routineEndDate.set(endOfDay(nextStartDate));
    }
  }

  onEndDateSelect(date: Date): void {
    const nextEndDate = endOfDay(date);
    const currentStartDate = this.routineStartDate();

    this.routineEndDate.set(nextEndDate);

    if (nextEndDate.getTime() < currentStartDate.getTime()) {
      this.routineStartDate.set(startOfDay(nextEndDate));
    }
  }

  onPrintRoutines(): void {
    globalThis.print?.();
  }
}
