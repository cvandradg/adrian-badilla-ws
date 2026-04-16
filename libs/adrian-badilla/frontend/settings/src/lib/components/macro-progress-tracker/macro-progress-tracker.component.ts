import {
  Component,
  computed,
  inject,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { settingsStoreDev } from '../../store/settings.store';
import { calculateConsumedMacros, calculateAllMacroPercentages, generateMacroMessages, calculateMealRecommendation, generateRecommendationFeedback } from '../../store/with-macro-tracker.feature';

/**
 * Componente para mostrar el progreso de macronutrientes
 * Utiliza el macro tracker del store y muestra progress bars para cada macro
 */
@Component({
  selector: 'lib-macro-progress-tracker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './macro-progress-tracker.component.html',
  styleUrl: './macro-progress-tracker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MacroProgressTrackerComponent {
  private readonly store = inject(settingsStoreDev);

  // Exponer Math al template
  Math = Math;

  // Inputs opcionales para personalizar
  showMessages = input<boolean>(true);
  showCalories = input<boolean>(true);
  compact = input<boolean>(false);
  meals = input<any[]>([]); // Input para recibir meals del padre

  // 🧮 Cálculos basados en meals input
  consumedMacros = computed<any>(() => calculateConsumedMacros(this.meals()));
  
  macroSnapshot = computed<any>(() => {
    const consumed = calculateConsumedMacros(this.meals());
    const goals = this.store.dailyGoals();
    const percentages = calculateAllMacroPercentages(consumed, goals);
    const messages = generateMacroMessages(percentages, consumed);
    
    const remaining =  {
      protein: Math.max(goals.protein - consumed.protein, 0),
      fats: Math.max(goals.fats - consumed.fats, 0),
      carbs: Math.max(goals.carbs - consumed.carbs, 0),
    };

    return {
      goals,
      consumed,
      remaining,
      percentages,
      messages,
      isAllComplete: percentages.average.isCompleted,
      completedCount: [
        percentages.protein.isCompleted,
        percentages.fats.isCompleted,
        percentages.carbs.isCompleted,
      ].filter(Boolean).length,
    } as any;
  });

  totalCalories = computed<number>(() => {
    return this.meals().reduce((total: number, meal: any) => {
      if (meal.status === 'completed') {
        return total + 
          meal.macros.protein * 4 + 
          meal.macros.carbs * 4 + 
          meal.macros.fats * 9;
      }
      return total;
    }, 0);
  });

  progressMessage = computed<string>(() => {
    const percentages = this.macroSnapshot().percentages;
    if (percentages.average.percentage >= 100) {
      return '🎉 ¡Perfecto! Has completado todos tus macros';
    }
    if (this.macroSnapshot().completedCount >= 2) {
      return '🔥 ¡Casi allá! Debes completar un macro más';
    }
    return '💪 Sigue comiendo para alcanzar tus metas';
  });

  /**
   * Detecta si hay algún macro consumido (para mostrar/ocultar recomendaciones)
   */
  hasStartedDiet = computed<boolean>(() => {
    const consumed = this.macroSnapshot().consumed;
    return consumed.protein > 0 || consumed.carbs > 0 || consumed.fats > 0;
  });

  /**
   * Detecta si ha completado todos los 3 macros al 100%
   */
  hasCompletedAllMacros = computed<boolean>(() => {
    return this.macroSnapshot().isAllComplete;
  });

  /**
   * Obtiene el color dynamic para una barra de progreso según el porcentaje
   */
  getMacroColor(macro: 'protein' | 'fats' | 'carbs'): string {
    const percentage = this.macroSnapshot().percentages[macro].percentage;

    if (percentage < 50) {
      return '#ef4444'; // Rojo
    } else if (percentage < 100) {
      return '#eab308'; // Amarillo
    } else if (this.macroSnapshot().percentages[macro].exceeded > 0) {
      return '#f97316'; // Naranja
    } else {
      return '#22c55e'; // Verde
    }
  }

  /**
   * Filtra mensajes de un macro específico
   */
  getMessagesForMacro(
    macro: 'protein' | 'fats' | 'carbs'
  ): any[] {
    return this.macroSnapshot().messages.filter(
      (msg: any) => msg.macro === macro
    );
  }

  /**
   * Obtiene mensajes generales (no específicos de un macro)
   */
  getGeneralMessages(): any[] {
    return this.macroSnapshot().messages.filter(
      (msg: any) => msg.macro === 'overall'
    );
  }

  /**
   * 🧠 Recomendación inteligente de tipo de comida (calculada localmente)
   */
  mealRecommendation = computed(() => {
    const consumed = calculateConsumedMacros(this.meals());
    const dailyGoal = this.store.dailyGoals();
    const percentages = calculateAllMacroPercentages(consumed, dailyGoal);
    
    const remaining = {
      protein: Math.max(dailyGoal.protein - consumed.protein, 0),
      carbs: Math.max(dailyGoal.carbs - consumed.carbs, 0),
      fats: Math.max(dailyGoal.fats - consumed.fats, 0),
    };
    
    const totalCals = this.meals().reduce((total: number, meal: any) => {
      if (meal.status === 'completed') {
        return (
          total +
          meal.macros.protein * 4 +
          meal.macros.carbs * 4 +
          meal.macros.fats * 9
        );
      }
      return total;
    }, 0);

    return calculateMealRecommendation(
      percentages,
      remaining,
      totalCals,
      dailyGoal
    );
  });

  /**
   * 💬 Feedback amigable sobre la recomendación
   */
  recommendationFeedback = computed(() => {
    const consumed = calculateConsumedMacros(this.meals());
    const dailyGoal = this.store.dailyGoals();
    const percentages = calculateAllMacroPercentages(consumed, dailyGoal);
    const recommended = this.mealRecommendation();
    
    return generateRecommendationFeedback(recommended, percentages);
  });

  /**
   * Formatea un número redondeando hacia arriba (sin decimales)
   */
  formatNumber(value: number, decimals: number = 0): string {
    // Redondear hacia arriba
    const multiplier = Math.pow(10, decimals);
    const rounded = Math.ceil(value * multiplier) / multiplier;
    return rounded.toFixed(decimals);
  }
}
