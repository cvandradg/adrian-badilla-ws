import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
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

  isComplete(dayId: string): boolean {
    return this.completedDayIds().has(dayId);
  }
}
