import { ChangeDetectionStrategy, Component, inject, input, output, signal, untracked } from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';
import { Tag } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import {
  DietMeal,
  MealDecision,
  MealOption,
} from '../../types/diet-decision.types';
import { MealTranslationService } from '../../services/meal-translation.service';
import { settingsStoreDev } from '../../store/settings.store';

@Component({
  selector: 'lib-adrian-badilla-diets-decision',
  imports: [NgClass, Tag, DecimalPipe, ButtonModule, RippleModule],
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
  // 🔥 SIGNAL (no computed) - solo se actualiza cuando usuario hace click en Ligero/Balanceado/Proteico
  suggestedMeal = signal<any>(null);

  constructor(private readonly mealTranslationService: MealTranslationService) {}

  selectDecision(decision: MealDecision) {
    const current = this.openedDecision();

    if (current === decision) {
      // Toggle off
      this.openedDecision.set(null);
      this.suggestedMeal.set(null); // 🔥 Limpiar sugerencia
      return;
    }

    // Toggle on - AHORA calcular la sugerencia CON untracked completo
    this.openedDecision.set(decision);
    
    // 🔥 CLAVE: untracked() evita que esto dependa de store.meals() o cualquier signal
    const suggestion = untracked(() => {
      const baseName = this.meal().baseName.toLowerCase();
      
      // Mapear nombre de comida a categoría
      let category: 'breakfast' | 'morning-snack' | 'lunch' | 'afternoon-snack' | 'dinner' | 'night-snack' = 'lunch';
      if (baseName.includes('desayuno')) category = 'breakfast';
      else if (baseName.includes('mañana')) category = 'morning-snack';
      else if (baseName.includes('tarde')) category = 'afternoon-snack';
      else if (baseName.includes('cena')) category = 'dinner';
      else if (baseName.includes('noche')) category = 'night-snack';
      
      return (this.store as any).getSuggestedMealByCategory(category, decision);
    });
    
    this.suggestedMeal.set(suggestion); // 🔥 Actualizar signal UNA SOLA VEZ
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
    this.decisionChange.emit({
      id: this.meal().id,
      decision,
      option,
      optionNameInSpanish: option.name,
      optionNameInEnglish: this.mealTranslationService.translateMealToEnglish(option.name),
    });

    this.openedDecision.set(null);
    this.suggestedMeal.set(null); // 🔥 Limpiar
  }

  // 🍽️ Seleccionar la comida sugerida automáticamente
  selectSuggestedMeal() {
    const suggestion = this.suggestedMeal();
    const decision = this.openedDecision();
    
    if (!suggestion?.items || suggestion.items.length === 0 || !decision) {
      return;
    }

    if (this.meal().selectedFoodName) {
      return;
    }

    const suggestedOption: MealOption = {
      name: suggestion.items.map((item: MealOption) => item.name).join(' + '),
      macros: suggestion.totals,
    };

    this.decisionChange.emit({
      id: this.meal().id,
      decision,
      option: suggestedOption,
      optionNameInSpanish: suggestedOption.name,
      optionNameInEnglish: suggestedOption.name,
    });

    this.openedDecision.set(null);
    this.suggestedMeal.set(null); // 🔥 Limpiar
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

  // 🤖 Abrir chat para una comida específica
  openChatForMeal(mealId: string) {
    this.store.openChatForMeal(mealId);
  }
}
