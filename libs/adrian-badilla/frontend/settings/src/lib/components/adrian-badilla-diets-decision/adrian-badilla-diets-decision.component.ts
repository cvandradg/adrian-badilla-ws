import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import type { DecisionItem, DietMeal, MealStatus } from '../../types/diet-decision.types';
import { MEAL_PREPARATION, MEALS_MOCK } from '../../mocks/meals.mock';
import { enrichMealStatus, mapMealToDecisionItem } from '../../adapters/decision-item.adapters';
import { DecisionCardComponent } from '../decision-card/decision-card.component';

type MealKey = 'breakfast' | 'morningSnack' | 'lunch' | 'afternoonSnack' | 'dinner' | 'nightSnack';

const MEAL_KEYWORDS: readonly [string, MealKey][] = [
  ['desayuno', 'breakfast'],
  ['mañana', 'morningSnack'],
  ['almuerzo', 'lunch'],
  ['tarde', 'afternoonSnack'],
  ['cena', 'dinner'],
  ['noche', 'nightSnack'],
];

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
  readonly statusChange = output<{ id: string; status: MealStatus; macros?: { protein: number; carbs: number; fats: number } }>();

  private readonly mealKey = computed<MealKey>(() => {
    const name = this.meal().baseName.toLowerCase();
    return MEAL_KEYWORDS.find(([kw]) => name.includes(kw))?.[1] ?? 'breakfast';
  });

  readonly decisionItem = computed<DecisionItem>(() => mapMealToDecisionItem(this.meal()));
  readonly fixedMeal = computed(() => MEALS_MOCK[this.mealKey()]);
  readonly preparationSummary = computed(() => MEAL_PREPARATION[this.mealKey()]);

  // Enriches the generic status event with meal macros via pure helper
  handleStatusChange(event: { id: string; status: DecisionItem['status'] }): void {
    this.statusChange.emit(enrichMealStatus(this.decisionItem(), event.status));
  }

  roundUp = Math.ceil;
}

