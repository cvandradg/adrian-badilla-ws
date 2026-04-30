import {
  Component,
  computed,
  inject,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { settingsStoreDev } from '../../store/settings.store';
import {
  calculateConsumedMacros,
  calculateAllMacroPercentages,
  generateMacroMessages,
} from '../../store/with-macro-tracker.feature';

type MacroType = 'protein' | 'fats' | 'carbs';

/**
 * Componente para mostrar el progreso de macronutrientes
 * Utiliza el macro tracker del store y muestra progress bars para cada macro
 */
@Component({
  selector: 'lib-macro-progress-tracker',
  standalone: true,
  imports: [],
  templateUrl: './macro-progress-tracker.component.html',
  styleUrl: './macro-progress-tracker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MacroProgressTrackerComponent {
  private readonly store = inject(settingsStoreDev);

  // Expose Math to template
  Math = Math;

  // Optional inputs for customization
  readonly showMessages = input<boolean>(true);
  readonly showCalories = input<boolean>(true);
  readonly compact = input<boolean>(false);
  readonly meals = input<any[]>([]); // Input to receive meals from parent

  // 🧮 Core calculations based on meals input
  private readonly consumedMacros = computed(() =>
    calculateConsumedMacros(this.meals())
  );

  readonly macroSnapshot = computed(() => {
    const consumed = this.consumedMacros();
    const goals = this.store.dailyGoals();
    const percentages = calculateAllMacroPercentages(consumed, goals);
    const messages = generateMacroMessages(percentages, consumed);

    const remaining = {
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
    };
  });

  readonly totalCalories = computed<number>(() => {
    return this.meals().reduce((total: number, meal: any) => {
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
  });

  readonly progressMessage = computed<string>(() => {
    const percentages = this.macroSnapshot().percentages;
    if (percentages.average.percentage >= 100) {
      return '🎉 ¡Perfecto! Has completado todos tus macros';
    }
    if (this.macroSnapshot().completedCount >= 2) {
      return '🔥 ¡Casi allá! Debes completar un macro más';
    }
    return '💪 Sigue comiendo para alcanzar tus metas';
  });

  // 🎨 Color computeds for each macro (memoized, not recalculated on every detection)
  readonly macroColors = computed<Record<MacroType, string>>(() => {
    const percentages = this.macroSnapshot().percentages;
    return {
      protein: this.computeMacroColor(percentages.protein),
      fats: this.computeMacroColor(percentages.fats),
      carbs: this.computeMacroColor(percentages.carbs),
    };
  });

  // 🎨 Stroke colors for circular progress (discrete ranges)
  readonly strokeColors = computed<Record<MacroType, string>>(() => {
    const percentages = this.macroSnapshot().percentages;
    return {
      protein: this.computeStrokeColor(percentages.protein.percentage),
      fats: this.computeStrokeColor(percentages.fats.percentage),
      carbs: this.computeStrokeColor(percentages.carbs.percentage),
    };
  });

  // ✅ Completion status computeds
  readonly hasStartedDiet = computed<boolean>(() => {
    const consumed = this.macroSnapshot().consumed;
    return consumed.protein > 0 || consumed.carbs > 0 || consumed.fats > 0;
  });

  readonly hasCompletedAllMacros = computed<boolean>(() => {
    return this.macroSnapshot().isAllComplete;
  });

  // 🎯 ADHERENCE COACHING signals
  readonly adherenceStatus = computed<'on-track' | 'behind' | 'ahead'>(() => {
    const avg = this.macroSnapshot().percentages.average.percentage;
    if (avg > 110) return 'ahead';
    if (avg >= 65) return 'on-track';
    return 'behind';
  });

  readonly adherenceStatusClass = computed<string>(() => {
    const status = this.adherenceStatus();
    if (status === 'on-track') return 'type--balanced';
    if (status === 'behind') return 'type--high-protein';
    return 'type--light';
  });

  readonly currentFocusMessage = computed<string>(() => {
    const { percentages } = this.macroSnapshot();
    const status = this.adherenceStatus();
    if (status === 'ahead') {
      return 'Estás por encima de tus metas del día. Modera el ritmo en las próximas comidas.';
    }
    if (status === 'on-track') {
      return 'Estás alineado con tu plan de alimentación para este momento del día.';
    }
    const macros = [
      { name: 'proteína', pct: percentages.protein.percentage },
      { name: 'grasas', pct: percentages.fats.percentage },
      { name: 'carbohidratos', pct: percentages.carbs.percentage },
    ];
    const lowest = macros.reduce((a, b) => (a.pct < b.pct ? a : b), macros[0]);
    return `Estás por debajo de tu ingesta planificada de ${lowest.name} para este momento del día.`;
  });

  readonly nextStepMessage = computed<string>(() => {
    const { percentages } = this.macroSnapshot();
    const status = this.adherenceStatus();
    if (status === 'on-track') {
      return 'Tu próxima comida planificada te ayudará a alcanzar tus metas del día.';
    }
    if (status === 'ahead') {
      return 'Considera una opción ligera para tu próxima comida y mantén el balance calórico.';
    }
    const macros = [
      { name: 'proteína', pct: percentages.protein.percentage },
      { name: 'grasas', pct: percentages.fats.percentage },
      { name: 'carbohidratos', pct: percentages.carbs.percentage },
    ];
    const lowest = macros.reduce((a, b) => (a.pct < b.pct ? a : b), macros[0]);
    return `Incluye alimentos ricos en ${lowest.name} en tu próxima comida para seguir tu plan.`;
  });

  // 🎯 Template helpers
  readonly getMacroColor = (macro: MacroType): string => this.macroColors()[macro];
  readonly getStrokeColor = (macro: MacroType): string => this.strokeColors()[macro];
  readonly isMacroComplete = (macro: MacroType): boolean =>
    this.macroSnapshot().percentages[macro].percentage >= 100;
  readonly getMessagesForMacro = (macro: MacroType): any[] =>
    this.macroSnapshot().messages.filter((msg: any) => msg.macro === macro);
  readonly getGeneralMessages = (): any[] =>
    this.macroSnapshot().messages.filter((msg: any) => msg.macro === 'overall');

  /**
   * Private helper: Compute macro color based on percentage thresholds
   */
  private computeMacroColor(percentage: any): string {
    if (percentage.percentage < 50) {
      return '#ef4444'; // Red
    } else if (percentage.percentage < 100) {
      return '#eab308'; // Yellow
    } else if (percentage.exceeded > 0) {
      return '#f97316'; // Orange
    } else {
      return '#22c55e'; // Green
    }
  }

  /**
   * Private helper: Compute stroke color in discrete ranges
   */
  private computeStrokeColor(percentage: number): string {
    if (percentage < 25) {
      return '#ef4444'; // Red 0-25%
    } else if (percentage < 50) {
      return '#f97316'; // Orange 25-50%
    } else if (percentage < 75) {
      return '#eab308'; // Yellow 50-75%
    } else if (percentage < 100) {
      return '#10b981'; // Light green 75-100%
    } else {
      return '#22c55e'; // Bright green 100%+
    }
  }

  /**
   * Format number with optional decimals
   */
  formatNumber(value: number, decimals: number = 0): string {
    const multiplier = Math.pow(10, decimals);
    const rounded = Math.ceil(value * multiplier) / multiplier;
    return rounded.toFixed(decimals);
  }
}
