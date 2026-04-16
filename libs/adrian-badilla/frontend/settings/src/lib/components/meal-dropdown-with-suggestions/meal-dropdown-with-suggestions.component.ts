/**
 * 🍽️ MEAL SUGGESTION COMPONENT EXAMPLE
 * 
 * This example shows how to integrate meal suggestions into your
 * existing meal dropdown/selection component.
 * 
 * Copy this pattern into your actual meal decision component.
 */

import {
  Component,
  ChangeDetectionStrategy,
  Input,
  computed,
  inject,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { settingsStoreDev } from '../../store/settings.store';
import type { SuggestedMeal, MealOption } from '../../types/diet-decision.types';

type MealCategory =
  | 'breakfast'
  | 'morning-snack'
  | 'lunch'
  | 'afternoon-snack'
  | 'dinner'
  | 'night-snack';

/**
 * EXAMPLE: Integration Pattern for Meal Suggestions
 * 
 * This component shows:
 * 1. How to inject the store
 * 2. How to compute category-specific suggestions
 * 3. How to display suggestions in the UI
 * 4. How to handle suggestion selection
 */
@Component({
  selector: 'lib-meal-dropdown-with-suggestions',
  templateUrl: './meal-dropdown-with-suggestions.component.html',
  styleUrl: './meal-dropdown-with-suggestions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  standalone: true,
})
export class MealDropdownWithSuggestionsComponent {
  @Input() mealId!: string;
  @Input() mealCategory!: MealCategory;
  @Input() predefinedOptions: Record<string, MealOption[]> = {};

  mealSelected = output<{
    id: string;
    foodName: string;
    macros: { protein: number; carbs: number; fats: number };
  }>();

  private store = inject(settingsStoreDev);

  // 🍽️ COMPUTE CATEGORY-SPECIFIC SUGGESTION
  // This will update automatically as user selects/changes meals
  suggestedMeal = computed(() => {
    return this.store.getSuggestedMealByCategory(this.mealCategory);
  });

  // 🍽️ ALTERNATIVE: Use global suggestion
  globalSuggestedMeal = this.store.suggestedMeal;

  // 🎯 Handle suggestion selection
  selectSuggestedMeal(suggested: SuggestedMeal) {
    // Combine all food items into a descriptive name
    const foodNames = suggested.items
      .map((item) => item.name)
      .join(' + ');

    // Emit the selection
    this.mealSelected.emit({
      id: this.mealId,
      foodName: foodNames,
      macros: suggested.totals,
    });

    // You could also:
    // - Store this in a signal for UI state
    // - Call a store method to apply the meal
    // - Show a confirmation toast
  }

  // 🎯 Handle predefined option selection
  selectOption(option: MealOption) {
    this.mealSelected.emit({
      id: this.mealId,
      foodName: option.name,
      macros: option.macros,
    });
  }

  // 🎨 Helper to get quality badge color
  getMatchQualityColor(nearestMatch: string): string {
    if (nearestMatch.includes('perfecta')) return 'success';
    if (nearestMatch.includes('cercana')) return 'info';
    if (nearestMatch.includes('Buena')) return 'warning';
    return 'secondary';
  }

  // 🔢 Redondear hacia arriba
  roundUp(value: number): number {
    return Math.ceil(value);
  }
}
