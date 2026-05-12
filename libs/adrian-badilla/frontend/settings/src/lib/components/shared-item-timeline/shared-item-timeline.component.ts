import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { Timeline as PrimeTimeline } from 'primeng/timeline';
import { ButtonModule } from 'primeng/button';
import { DayTimelineShellComponent } from '@adrian-badilla/ui/shared';
import type { DayBase } from '@adrian-badilla/ui/shared';
import { SharedItemDecisionComponent, isRoutineItem } from '../shared-item-decision/shared-item-decision.component';
import type { SharedItem } from '../shared-item-decision/shared-item-decision.component';
import type { MealStatus } from '../../types/diet-decision.types';
import type { RouteSupercenterItem } from '../../types/diets.types';

@Component({
  selector: 'lib-shared-item-timeline',
  standalone: true,
  imports: [NgClass, PrimeTimeline, ButtonModule, DayTimelineShellComponent, SharedItemDecisionComponent],
  templateUrl: './shared-item-timeline.component.html',
  styleUrl: './shared-item-timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharedItemTimelineComponent {
  // ─── Day sidebar ──────────────────────────────────────────────────────────
  readonly days = input.required<DayBase[]>();
  readonly selectedDayId = input.required<string>();
  readonly completedDayIds = input.required<Set<string>>();

  // ─── Timeline items ───────────────────────────────────────────────────────
  readonly items = input.required<SharedItem[]>();
  readonly isTimelineComplete = input<boolean>(false);

  // ─── Empty state ──────────────────────────────────────────────────────────
  readonly emptyTitle = input<string>('No hay elementos asignados aún.');
  readonly emptyText = input<string>('Cuando se agreguen elementos, se reflejarán aquí.');
  readonly emptyButtonLabel = input<string | null>(null);

  // ─── Outputs ──────────────────────────────────────────────────────────────
  readonly daySelected = output<string>();
  /** Emits the full item when the timeline marker is clicked. */
  readonly markerClick = output<SharedItem>();
  readonly statusChange = output<{
    id: string;
    status: MealStatus;
    macros?: { protein: number; carbs: number; fats: number };
  }>();
  readonly openChat = output<string>();
  readonly itemDetails = output<string>();
  readonly emptyAction = output<void>();

  getMarkerClasses(item: SharedItem): Record<string, boolean> {
    const status = item.status ?? 'pending';
    return {
      [status]: true,
      'pulse-marker': status === 'completed' || status === 'skipped',
    };
  }

  getMarkerIcon(item: SharedItem): string {
    return isRoutineItem(item) ? 'pi pi-calendar' : (item as RouteSupercenterItem).imgPrimeng;
  }
}
