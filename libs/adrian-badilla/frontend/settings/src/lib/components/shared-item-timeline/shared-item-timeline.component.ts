import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { Timeline as PrimeTimeline } from 'primeng/timeline';
import { ButtonModule } from 'primeng/button';
import { DayTimelineShellComponent } from '@adrian-badilla/ui/shared';
import { TourAnchorDirective } from '@adrian-badilla/ui/shared';
import type { DayBase } from '@adrian-badilla/ui/shared';
import {
  SharedItemDecisionComponent,
  isRoutineItem,
} from '../shared-item-decision/shared-item-decision.component';
import type { SharedItem } from '../shared-item-decision/shared-item-decision.component';
import type { MealStatus } from '../../types/diet-decision.types';
import type { RouteSupercenterItem } from '../../types/diets.types';

@Component({
  selector: 'lib-shared-item-timeline',
  standalone: true,
  imports: [
    NgClass,
    PrimeTimeline,
    ButtonModule,
    DayTimelineShellComponent,
    SharedItemDecisionComponent,
    TourAnchorDirective,
  ],
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

  // ─── Section heading ───────────────────────────────────────────────────────
  readonly headingTitle = input<string | null>(null);
  readonly headingSubtitle = input<string | null>(null);

  // ─── Empty state ──────────────────────────────────────────────────────────
  readonly emptyTitle = input<string>('No hay elementos asignados aún.');
  readonly emptyText = input<string>(
    'Cuando se agreguen elementos, se reflejarán aquí.'
  );
  readonly emptyButtonLabel = input<string | null>(null);
  /**
   * When set to a non-null string, replaces the generic empty state with
   * a rest-day card showing this label (e.g. "Domingo").
   * The sidebar stays visible regardless.
   */
  readonly restDayLabel = input<string | null>(null);

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
    return isRoutineItem(item)
      ? 'pi pi-calendar'
      : (item as RouteSupercenterItem).imgPrimeng;
  }

  /** Returns true for the first item — used to conditionally register tour anchors. */
  isFirstItem(item: SharedItem): boolean {
    return this.items()[0]?.id === item.id;
  }
}
