import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { Tag } from 'primeng/tag';
import {
  DietMeal,
  MealDecision,
  MealOption,
} from '../../types/diet-decision.types';
import { MealTranslationService } from '../../services/meal-translation.service';

@Component({
  selector: 'lib-adrian-badilla-diets-decision',
  imports: [NgClass, Tag],
  templateUrl: './adrian-badilla-diets-decision.component.html',
  styleUrl: './adrian-badilla-diets-decision.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdrianBadillaDietsDecisionComponent {

  meal = input.required<DietMeal>();

  decisionChange = output<{
    id: string;
    decision: MealDecision;
    option: MealOption;
    optionNameInSpanish: string;
    optionNameInEnglish: string;
  }>();
  mealDialogRequested = output<string>();

  openedDecision = signal<MealDecision | null>(null);

  constructor(private readonly mealTranslationService: MealTranslationService) {}

  // ⭐ recomendación inteligente
  recommended = computed(() => {
    const currentMeal = this.meal();
    if (!currentMeal?.macros) return 'balanced';

    if (currentMeal.macros.protein < 20) return 'high-protein';
    if (currentMeal.macros.carbs > 40) return 'light';

    return 'balanced';
  });

  selectDecision(decision: MealDecision) {
    this.openedDecision.update((current) =>
      current === decision ? null : decision,
    );
  }

  getOptionsForDecision(decision: MealDecision): MealOption[] {
    return this.meal().decisionOptions?.[decision] ?? [];
  }

  selectMealOption(option: MealOption) {
    const decision = this.openedDecision();

    if (!decision) {
      return;
    }

    // ✅ Emitir cambio de decisión 
    // (applyMealDecision en store AUTO-marca como 'completed')
    this.decisionChange.emit({
      id: this.meal().id,
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
    this.mealDialogRequested.emit(this.meal().id);
  }

  getStatusLabel(): string {
    const status = this.meal().status;
    if (status === 'completed') return 'Completado';
    if (status === 'skipped') return 'Incompleto';
    return 'Pendiente';
  }

  getStatusSeverity(): 'success' | 'danger' | 'info' {
    const status = this.meal().status;
    if (status === 'completed') return 'success';
    if (status === 'skipped') return 'danger';
    return 'info';
  }
}
