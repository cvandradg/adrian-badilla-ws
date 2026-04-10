import { ChangeDetectionStrategy, Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import {
  DietMeal,
  MealDecision,
  MealOption,
  MealStatus,
} from '../../types/diet-decision.types';
import { MealTranslationService } from '../../services/meal-translation.service';

@Component({
  selector: 'lib-adrian-badilla-diets-decision',
  imports: [NgClass],
  templateUrl: './adrian-badilla-diets-decision.component.html',
  styleUrl: './adrian-badilla-diets-decision.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdrianBadillaDietsDecisionComponent {

  @Input() meal!: DietMeal;

  @Output() statusChange = new EventEmitter<{ id: string; status: MealStatus }>();
  @Output() decisionChange = new EventEmitter<{
    id: string;
    decision: MealDecision;
    option: MealOption;
    optionNameInSpanish: string;
    optionNameInEnglish: string;
  }>();
  @Output() mealDialogRequested = new EventEmitter<string>();

  openedDecision = signal<MealDecision | null>(null);

  constructor(private mealTranslationService: MealTranslationService) {}

  // ⭐ recomendación inteligente
  recommended = computed(() => {
    if (!this.meal?.macros) return 'balanced';

    if (this.meal.macros.protein < 20) return 'high-protein';
    if (this.meal.macros.carbs > 40) return 'light';

    return 'balanced';
  });

  selectDecision(decision: MealDecision) {
    this.openedDecision.update((current) =>
      current === decision ? null : decision,
    );
  }

  getOptionsForDecision(decision: MealDecision): MealOption[] {
    return this.meal.decisionOptions?.[decision] ?? [];
  }

  selectMealOption(option: MealOption) {
    const decision = this.openedDecision();

    if (!decision) {
      return;
    }

    this.decisionChange.emit({
      id: this.meal.id,
      decision,
      option,
      optionNameInSpanish: option.name,
      optionNameInEnglish: this.mealTranslationService.translateMealToEnglish(option.name),
    });

    this.openedDecision.set(null);
  }

  isDecisionOpen(decision: MealDecision): boolean {
    return this.openedDecision() === decision;
  }

  openMealDialog() {
    this.mealDialogRequested.emit(this.meal.id);
  }

  completeMeal() {
    this.statusChange.emit({
      id: this.meal.id,
      status: 'completed'
    });
  }

  skipMeal() {
    this.statusChange.emit({
      id: this.meal.id,
      status: 'skipped'
    });
  }

  //emitir eventos



}
