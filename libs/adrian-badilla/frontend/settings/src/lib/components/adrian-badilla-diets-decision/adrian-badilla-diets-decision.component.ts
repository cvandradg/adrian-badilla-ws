import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import type { DecisionItem, DietMeal, MealStatus } from '../../types/diet-decision.types';
import { enrichMealStatus, mapMealToDecisionItem } from '../../adapters/decision-item.adapters';
import { DecisionCardComponent } from '../decision-card/decision-card.component';
import { splitTextToBulletItems } from '@adrian-badilla/ui/shared';

@Component({
  selector: 'lib-adrian-badilla-diets-decision',
  standalone: true,
  imports: [DecisionCardComponent],
  templateUrl: './adrian-badilla-diets-decision.component.html',
  styleUrl: './adrian-badilla-diets-decision.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdrianBadillaDietsDecisionComponent {
  readonly meal = input.required<DietMeal>();
  readonly mealDialogRequested = output<string>();
  readonly openChat = output<string>();
  readonly statusChange = output<{
    id: string;
    status: MealStatus;
    macros?: { protein: number; carbs: number; fats: number };
  }>();

  readonly highlightedBulletIndex = signal<number | null>(null);

  readonly decisionItem = computed<DecisionItem>(() => {
    return mapMealToDecisionItem(this.meal());
  });

  readonly descriptionBullets = computed(() => {
    return splitTextToBulletItems(this.meal().description);
  });

  onBulletClick(index: number): void {
    this.highlightedBulletIndex.set(this.highlightedBulletIndex() === index ? null : index);
  }

  // Enriches the generic status event with meal macros via pure helper
  handleStatusChange(event: { id: string; status: DecisionItem['status'] }): void {
    this.statusChange.emit(enrichMealStatus(this.decisionItem(), event.status));
  }

  roundUp = Math.ceil;
}

