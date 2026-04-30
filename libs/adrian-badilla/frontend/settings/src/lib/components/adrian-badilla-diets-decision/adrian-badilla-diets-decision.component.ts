import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { DietMeal } from '../../types/diet-decision.types';
import { MEAL_PREPARATION, MEALS_MOCK } from '../../mocks/meals.mock';
import { settingsStoreDev } from '../../store/settings.store';

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
  imports: [],
  templateUrl: './adrian-badilla-diets-decision.component.html',
  styleUrl: './adrian-badilla-diets-decision.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdrianBadillaDietsDecisionComponent {
  readonly meal = input.required<DietMeal>();
  readonly mealDialogRequested = output<string>();
  readonly statusChange = output<{ id: string; status: 'completed' | 'skipped' | 'pending'; macros?: { protein: number; carbs: number; fats: number } }>();
  readonly isDropdownOpen = signal(false);

  private readonly store = inject(settingsStoreDev);

  private readonly mealKey = computed<MealKey>(() => {
    const name = this.meal().baseName.toLowerCase();
    return MEAL_KEYWORDS.find(([kw]) => name.includes(kw))?.[1] ?? 'breakfast';
  });

  readonly fixedMeal = computed(() => MEALS_MOCK[this.mealKey()]);
  readonly preparationSummary = computed(() => MEAL_PREPARATION[this.mealKey()]);

  toggleDropdown(): void {
    this.isDropdownOpen.update(v => !v);
  }

  acceptMeal(): void {
    const current = this.meal();
    const newStatus = current.status === 'completed' ? 'pending' : 'completed';
    this.statusChange.emit({
      id: current.id,
      status: newStatus,
      macros: newStatus === 'completed' ? this.fixedMeal().macros : undefined,
    });
  }

  rejectMeal(): void {
    const current = this.meal();
    this.statusChange.emit({
      id: current.id,
      status: current.status === 'skipped' ? 'pending' : 'skipped',
    });
  }

  openChat(): void {
    this.store.openChatForMeal(this.meal().id);
  }

  openDetails(): void {
    this.mealDialogRequested.emit(this.meal().id);
  }

  roundUp = Math.ceil;
}
