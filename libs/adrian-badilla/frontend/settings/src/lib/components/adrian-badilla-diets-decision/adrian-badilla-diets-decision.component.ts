import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';
import { Tag } from 'primeng/tag';
import {
  DietMeal,
  MealDecision,
  MealOption,
} from '../../types/diet-decision.types';
import { MealTranslationService } from '../../services/meal-translation.service';
import { settingsStoreDev } from '../../store/settings.store';

@Component({
  selector: 'lib-adrian-badilla-diets-decision',
  imports: [NgClass, Tag, DecimalPipe],
  templateUrl: './adrian-badilla-diets-decision.component.html',
  styleUrl: './adrian-badilla-diets-decision.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdrianBadillaDietsDecisionComponent {

  meal = input.required<DietMeal>();
  private readonly store = inject(settingsStoreDev);

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

  // 🍽️ SUGERENCIA DE COMIDA - Generada automáticamente basada en macros restantes Y tipo de decisión
  suggestedMeal = computed(() => {
    const baseName = this.meal().baseName.toLowerCase();
    const decision = this.openedDecision(); // 🎯 Considerar qué decisión está abierta
    
    // Mapear nombre de comida a categoría
    let category: 'breakfast' | 'morning-snack' | 'lunch' | 'afternoon-snack' | 'dinner' | 'night-snack' = 'lunch';
    
    if (baseName.includes('desayuno')) {
      category = 'breakfast';
    } else if (baseName.includes('mañana')) {
      category = 'morning-snack';
    } else if (baseName.includes('almuerzo') || baseName.includes('comida')) {
      category = 'lunch';
    } else if (baseName.includes('tarde')) {
      category = 'afternoon-snack';
    } else if (baseName.includes('cena')) {
      category = 'dinner';
    } else if (baseName.includes('noche')) {
      category = 'night-snack';
    }
    
    // 🎯 NUEVO: Pasar el tipo de decisión a la función de sugerencia
    // Esto genera recomendaciones diferentes para light/balanced/protein
    return (this.store as any).getSuggestedMealByCategory(category, decision);
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

  // 🍽️ Seleccionar la comida sugerida automáticamente
  selectSuggestedMeal() {
    const suggestion = this.suggestedMeal();
    const decision = this.openedDecision(); // ✅ Respetar la decisión actualmente abierta
    
    if (!suggestion?.items || suggestion.items.length === 0 || !decision) {
      return;
    }

    // Crear una opción virtual combinando todos los items de la sugerencia
    const suggestedOption: MealOption = {
      name: suggestion.items.map((item: MealOption) => item.name).join(' + '),
      macros: suggestion.totals,
    };

    // ✅ IMPORTANTE: Emitir con la decisión abierta, NO siempre 'balanced'
    this.decisionChange.emit({
      id: this.meal().id,
      decision, // ← Usar la decisión actual (light/balanced/protein)
      option: suggestedOption,
      optionNameInSpanish: suggestedOption.name,
      optionNameInEnglish: suggestedOption.name,
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

  // 🔢 Redondear hacia arriba
  roundUp(value: number): number {
    return Math.ceil(value);
  }
}
