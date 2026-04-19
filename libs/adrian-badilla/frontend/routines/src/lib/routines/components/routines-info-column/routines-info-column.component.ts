import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import type { RoutineSummary } from '../../types/routine.types';

@Component({
  selector: 'lib-routines-info-column',
  imports: [FontAwesomeModule],
  templateUrl: './routines-info-column.component.html',
  styleUrl: './routines-info-column.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoutinesInfoColumnComponent {
  readonly summary = input.required<RoutineSummary>();
  readonly currentWeekTitle = input.required<string>();
}
