import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { DaySidebarComponent } from '../day-sidebar/day-sidebar.component';
import type { DayBase } from '../../types/day-base.types';

@Component({
  selector: 'lib-day-timeline-shell',
  standalone: true,
  imports: [DaySidebarComponent],
  templateUrl: './day-timeline-shell.component.html',
  styleUrl: './day-timeline-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DayTimelineShellComponent {
  readonly days = input.required<DayBase[]>();
  readonly selectedDayId = input.required<string>();
  readonly completedDayIds = input<ReadonlySet<string>>(new Set());

  readonly daySelected = output<string>();
}
