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
  computed,
  inject,
  input,
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
  private readonly store = inject(settingsStoreDev);

  // Signal-based inputs (replaced @Input)
  readonly mealId = input.required<string>();
  readonly mealCategory = input.required<MealCategory>();
  readonly predefinedOptions = input<Record<string, MealOption[]>>({});

  // Signal-based output
  readonly mealSelected = output<{
    id: string;
    foodName: string;
    macros: { protein: number; carbs: number; fats: number };
  }>();

  // 🍽️ Compute category-specific suggestion (reactive, memoized)
  readonly suggestedMeal = computed(() => {
    return this.store.getSuggestedMealByCategory(this.mealCategory());
  });

  // 🍽️ Alternative: Use global suggestion
  readonly globalSuggestedMeal = this.store.suggestedMeal;

  // 🎯 Handle suggestion selection
  readonly selectSuggestedMeal = (suggested: SuggestedMeal) => {
    const foodNames = suggested.items.map((item) => item.name).join(' + ');

    this.mealSelected.emit({
      id: this.mealId(),
      foodName: foodNames,
      macros: suggested.totals,
    });
  };

  // 🎯 Handle predefined option selection
  readonly selectOption = (option: MealOption) => {
    this.mealSelected.emit({
      id: this.mealId(),
      foodName: option.name,
      macros: option.macros,
    });
  };

  // 🎨 Helper to get quality badge color
  readonly getMatchQualityColor = (nearestMatch: string): string => {
    if (nearestMatch.includes('perfecta')) return 'success';
    if (nearestMatch.includes('cercana')) return 'info';
    if (nearestMatch.includes('Buena')) return 'warning';
    return 'secondary';
  };

  // 🔢 Round up utility
  readonly roundUp = (value: number): number => Math.ceil(value);
}
