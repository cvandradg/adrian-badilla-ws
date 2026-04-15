import {
  computed,
} from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import type {
  DietMeal,
  MacroGoals,
  MacroSnapshot,
  MacroPercentage,
  MacroMessage,
} from '../types/diet-decision.types';

/**
 * 📊 TIPOS Y INTERFACES PARA MACRO TRACKING
 */
export interface MacroTrackerState {
  dailyGoals: MacroGoals;
  meals: DietMeal[];
}

interface MacroSummary {
  protein: number;
  fats: number;
  carbs: number;
}

interface MacroPercentages {
  protein: MacroPercentage;
  fats: MacroPercentage;
  carbs: MacroPercentage;
  average: MacroPercentage;
}

/**
 * 🧮 FUNCIONES DE CÁLCULO REUTILIZABLES
 */

/**
 * Calcula los macronutrientes totales consumidos
 */
export function calculateConsumedMacros(meals: DietMeal[]): MacroSummary {
  return meals.reduce(
    (acc, meal) => {
      if (meal.status === 'completed') {
        acc.protein += meal.macros.protein;
        acc.fats += meal.macros.fats;
        acc.carbs += meal.macros.carbs;
      }
      return acc;
    },
    { protein: 0, fats: 0, carbs: 0 }
  );
}

/**
 * Calcula el porcentaje de un macronutriente
 * Retorna un objeto con el porcentaje y si está completado/excedido
 */
export function calculateMacroPercentage(
  consumed: number,
  goal: number
): MacroPercentage {
  if (goal <= 0) return { percentage: 0, remaining: 0, exceeded: 0, isCompleted: false };

  const percentage = Math.min((consumed / goal) * 100, 100);
  const remaining = Math.max(goal - consumed, 0);
  const exceeded = Math.max(consumed - goal, 0);
  const isCompleted = consumed >= goal;

  return {
    percentage: Math.round(percentage * 10) / 10, // Redondear a 1 decimal
    remaining,
    exceeded,
    isCompleted,
  };
}

/**
 * Calcula todos los porcentajes de macros
 */
export function calculateAllMacroPercentages(
  consumed: MacroSummary,
  goals: MacroGoals
): MacroPercentages {
  const protein = calculateMacroPercentage(consumed.protein, goals.protein);
  const fats = calculateMacroPercentage(consumed.fats, goals.fats);
  const carbs = calculateMacroPercentage(consumed.carbs, goals.carbs);

  const averagePercentage =
    (protein.percentage + fats.percentage + carbs.percentage) / 3;

  return {
    protein,
    fats,
    carbs,
    average: {
      percentage: Math.round(averagePercentage * 10) / 10,
      remaining: protein.remaining + fats.remaining + carbs.remaining,
      exceeded: protein.exceeded + fats.exceeded + carbs.exceeded,
      isCompleted: protein.isCompleted && fats.isCompleted && carbs.isCompleted,
    },
  };
}

/**
 * Genera mensajes dinámicos según el estado de los macros
 */
export function generateMacroMessages(
  percentages: MacroPercentages,
  consumed: MacroSummary
): MacroMessage[] {
  const messages: MacroMessage[] = [];

  // Mensaje de proteína
  if (percentages.protein.exceeded > 0) {
    messages.push({
      macro: 'protein',
      text: `Has excedido proteínas por ${Math.round(percentages.protein.exceeded)}g`,
      type: 'warning',
    });
  } else if (percentages.protein.remaining > 0) {
    messages.push({
      macro: 'protein',
      text: `Te faltan ${Math.round(percentages.protein.remaining)}g de proteína`,
      type: 'info',
    });
  } else {
    messages.push({
      macro: 'protein',
      text: '✅ Proteína completada',
      type: 'success',
    });
  }

  // Mensaje de grasas
  if (percentages.fats.exceeded > 0) {
    messages.push({
      macro: 'fats',
      text: `Has excedido grasas por ${Math.round(percentages.fats.exceeded)}g`,
      type: 'warning',
    });
  } else if (percentages.fats.remaining > 0) {
    messages.push({
      macro: 'fats',
      text: `Te faltan ${Math.round(percentages.fats.remaining)}g de grasas`,
      type: 'info',
    });
  } else {
    messages.push({
      macro: 'fats',
      text: '✅ Grasas completadas',
      type: 'success',
    });
  }

  // Mensaje de carbohidratos
  if (percentages.carbs.exceeded > 0) {
    messages.push({
      macro: 'carbs',
      text: `Has excedido carbohidratos por ${Math.round(percentages.carbs.exceeded)}g`,
      type: 'warning',
    });
  } else if (percentages.carbs.remaining > 0) {
    messages.push({
      macro: 'carbs',
      text: `Te faltan ${Math.round(percentages.carbs.remaining)}g de carbohidratos`,
      type: 'info',
    });
  } else {
    messages.push({
      macro: 'carbs',
      text: '✅ Carbohidratos completados',
      type: 'success',
    });
  }

  // Mensaje general
  if (percentages.average.isCompleted) {
    messages.push({
      macro: 'overall',
      text: '🎉 ¡Has completado tus macros del día!',
      type: 'success',
    });
  } else {
    const avgRemaining = Math.round(percentages.average.remaining);
    if (avgRemaining < 50) {
      messages.push({
        macro: 'overall',
        text: '🔥 ¡Estás muy cerca de completar tus macros!',
        type: 'info',
      });
    }
  }

  return messages;
}

/**
 * 📈 SIGNAL STORE FEATURE PARA MACRO TRACKING
 */
export function withMacroTracker() {
  return signalStoreFeature(
    withState<MacroTrackerState>({
      dailyGoals: {
        protein: 120,
        fats: 60,
        carbs: 200,
      },
      meals: [],
    }),

    // 🧮 COMPUTED PROPERTIES
    withComputed((store) => ({
      // Macros consumidos
      consumedMacros: computed(() => {
        const meals = (store as any).meals?.() ?? [];
        return calculateConsumedMacros(meals.filter((m: any) => m.status === 'completed'));
      }),

      // Macros restantes para el día
      remainingMacros: computed(() => {
        const consumed = calculateConsumedMacros((store as any).meals?.() ?? []);
        const goals = store.dailyGoals();

        return {
          protein: Math.max(goals.protein - consumed.protein, 0),
          fats: Math.max(goals.fats - consumed.fats, 0),
          carbs: Math.max(goals.carbs - consumed.carbs, 0),
        };
      }),

      // Porcentajes de cada macro
      macroPercentages: computed(() => {
        const consumed = calculateConsumedMacros((store as any).meals?.() ?? []);
        const goals = store.dailyGoals();
        return calculateAllMacroPercentages(consumed, goals);
      }),

      // Mensajes dinámicos para el usuario
      macroMessages: computed(() => {
        const consumed = calculateConsumedMacros((store as any).meals?.() ?? []);
        const goals = store.dailyGoals();
        const percentages = calculateAllMacroPercentages(consumed, goals);
        return generateMacroMessages(percentages, consumed);
      }),

      // Snapshot completo para facilitar acceso en templates
      macroSnapshot: computed(() => {
        const consumed = calculateConsumedMacros(store.meals());
        const remaining = {
          protein: Math.max(store.dailyGoals().protein - consumed.protein, 0),
          fats: Math.max(store.dailyGoals().fats - consumed.fats, 0),
          carbs: Math.max(store.dailyGoals().carbs - consumed.carbs, 0),
        };
        const percentages = calculateAllMacroPercentages(
          consumed,
          store.dailyGoals()
        );

        return {
          goals: store.dailyGoals(),
          consumed,
          remaining,
          percentages,
          messages: generateMacroMessages(percentages, consumed),
          isAllComplete: percentages.average.isCompleted,
          completedCount: [
            percentages.protein.isCompleted,
          percentages.fats.isCompleted,
            percentages.carbs.isCompleted,
          ].filter(Boolean).length,
        } as MacroSnapshot;
      }),

      // Total de calorías (bonus)
      totalCalories: computed(() => {
        const mealsFromEngine = (store as any).meals?.() ?? [];
        return mealsFromEngine.reduce((total: number, meal: any) => {
          if (meal.status === 'completed') {
            // Fórmula: (proteína × 4) + (carbos × 4) + (grasas × 9)
            return (
              total +
              meal.macros.protein * 4 +
              meal.macros.carbs * 4 +
              meal.macros.fats * 9
            );
          }
          return total;
        }, 0);
      }),
    })),

    // 🛠️ METHODS
    withMethods((store) => ({
      /**
       * Actualiza los objetivos diarios de macros
       */
      setDailyGoals(goals: Partial<MacroGoals>) {
        const currentGoals = store.dailyGoals();
        patchState(store, {
          dailyGoals: {
            protein: goals.protein ?? currentGoals.protein,
            fats: goals.fats ?? currentGoals.fats,
            carbs: goals.carbs ?? currentGoals.carbs,
          },
        });
      },

      /**
       * Actualiza la lista de comidas
       */
      updateMeals(meals: DietMeal[]) {
        patchState(store, { meals });
      },

      /**
       * Obtiene el resumen en porcentaje de un macro específico
       */
      getMacroPercentage(macro: keyof MacroGoals): MacroPercentage {
        return store.macroPercentages()[macro];
      },

      /**
       * Verifica si un macro está completado
       */
      isMacroCompleted(macro: keyof MacroGoals): boolean {
        return store.macroPercentages()[macro].isCompleted;
      },

      /**
       * Verifica si TODOS los macros están completados
       */
      areAllMacrosCompleted(): boolean {
        const percentages = store.macroPercentages();
        return (
          percentages.protein.isCompleted &&
          percentages.fats.isCompleted &&
          percentages.carbs.isCompleted
        );
      },

      /**
       * Obtiene el color de progreso basado en el porcentaje (para UI)
       */
      getMacroColor(macro: keyof MacroGoals): string {
        const percentage = store.macroPercentages()[macro];

        if (percentage.percentage < 50) {
          return '#ef4444'; // Rojo
        } else if (percentage.percentage < 100) {
          return '#eab308'; // Amarillo
        } else if (percentage.exceeded > 0) {
          return '#f97316'; // Naranja
        } else {
          return '#22c55e'; // Verde
        }
      },

      /**
       * Obtiene un mensaje amigable sobre el progreso general
       */
      getProgressMessage(): string {
        const snapshot = store.macroSnapshot();

        if (snapshot.isAllComplete) {
          return '🎉 ¡Perfecto! Has completado todos tus macros';
        }

        const completed = snapshot.completedCount;
        switch (completed) {
          case 2:
            return '🔥 ¡Casi allá! Debes completar un macro más';
          case 1:
            return '💪 Buen progreso, sigue avanzando';
          default:
            return '🎯 Sigue comiendo para alcanzar tus metas';
        }
      },

      /**
       * Reset de macros (para nuevo día)
       */
      resetMacros() {
        patchState(store, {
          meals: store.meals().map((meal) => ({
            ...meal,
            status: 'pending' as const,
          })),
        });
      },
    }))
  );
}
