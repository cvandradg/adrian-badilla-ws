import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { DecisionCardComponent } from '../decision-card/decision-card.component';
import { ExerciseDropdownComponent } from '../with-routines/exercise-dropdown/exercise-dropdown.component';
import { splitTextToBulletItems } from '@adrian-badilla/ui/shared';
import type { DecisionItem, MealStatus } from '../../types/diet-decision.types';
import {
  enrichMealStatus,
  mapMealToDecisionItem,
  mapRoutineToDecisionItem,
  type Routine,
} from '../../adapters/decision-item.adapters';
import type { RouteSupercenterItem } from '../../types/diets.types';

export type SharedItem = Routine | RouteSupercenterItem;

export function isRoutineItem(item: SharedItem): item is Routine {
  return 'exercises' in item;
}

@Component({
  selector: 'lib-shared-item-decision',
  standalone: true,
  imports: [DecisionCardComponent, ExerciseDropdownComponent],
  templateUrl: './shared-item-decision.component.html',
  styleUrl: './shared-item-decision.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharedItemDecisionComponent {
  readonly item = input.required<SharedItem>();

  readonly statusChange = output<{
    id: string;
    status: MealStatus;
    macros?: { protein: number; carbs: number; fats: number };
  }>();
  readonly openChat = output<string>();
  readonly itemDetails = output<string>();

  readonly highlightedBulletIndex = signal<number | null>(null);

  readonly isRoutine = computed(() => isRoutineItem(this.item()));
  readonly asRoutine = computed(() => this.item() as Routine);
  readonly asMeal = computed(() => this.item() as RouteSupercenterItem);

  readonly decisionItem = computed<DecisionItem>(() => {
    const item = this.item();
    if (isRoutineItem(item)) {
      return mapRoutineToDecisionItem(item);
    }
    // RouteSupercenterItem is structurally compatible with DietMeal for mapping
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return mapMealToDecisionItem(item as any);
  });

  readonly descriptionBullets = computed(() => {
    const item = this.item();
    if (isRoutineItem(item)) return [];
    return splitTextToBulletItems(item.description ?? '');
  });

  onBulletClick(index: number): void {
    this.highlightedBulletIndex.set(
      this.highlightedBulletIndex() === index ? null : index
    );
  }

  handleStatusChange(event: { id: string; status: DecisionItem['status'] }): void {
    if (isRoutineItem(this.item())) {
      this.statusChange.emit({ id: event.id, status: event.status });
    } else {
      this.statusChange.emit(enrichMealStatus(this.decisionItem(), event.status));
    }
  }

  readonly roundUp = Math.ceil;
}
