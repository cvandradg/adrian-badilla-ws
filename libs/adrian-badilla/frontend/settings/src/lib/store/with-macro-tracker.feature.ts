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
  MealRecommendation,
  RecommendationFeedback,
  MealDecision,
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
 * 🧠 RECOMMENDATION ENGINE HELPERS
 */

/**
 * Calcula el macro más bajo (con mayor necesidad)
 */
function findLowestMacro(
  remaining: Record<string, number>
): 'protein' | 'carbs' | 'fats' {
  const entries = Object.entries(remaining);
  const [lowest] = entries.reduce(
    (prev, current) => (current[1] < prev[1] ? current : prev),
    entries[0]
  );
  return lowest as 'protein' | 'carbs' | 'fats';
}

/**
 * Calcula el promedio de macros restantes para detectar balance
 */
function calculateMacroBalance(
  remaining: Record<string, number>
): { isBalanced: boolean; variance: number } {
  const values = Object.values(remaining).filter((v) => v > 0);
  if (values.length === 0) {
    return { isBalanced: true, variance: 0 };
  }

  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = Math.max(
    ...values.map((v) => Math.abs((v - avg) / (avg || 1)) * 100)
  );

  // Considerar balanceado si la varianza es ±10%
  return { isBalanced: variance <= 10, variance };
}

/**
 * Motor central de recomendaciones basado en macros restantes
 */
export function calculateMealRecommendation(
  percentages: MacroPercentages,
  remaining: Record<string, number>,
  totalCalories: number,
  dailyGoal: MacroGoals
): MealRecommendation {
  const calorieGoal = dailyGoal.protein * 4 + dailyGoal.carbs * 4 + dailyGoal.fats * 9;
  const caloriesRemaining = calorieGoal - totalCalories;

  // 1️⃣ Si proteína >= 100%, evita proteico
  if (percentages.protein.isCompleted) {
    // 2️⃣ Si carbos son el macro más bajo, recomienda balanceado
    const lowestMacro = findLowestMacro(remaining);
    if (lowestMacro === 'carbs' && remaining['carbs'] > 0) {
      return {
        type: 'balanced',
        reason: 'Proteína completada, enfócate en carbohidratos',
        confidence: 85,
      };
    }
    // Proteína completada, busca algo ligero
    return {
      type: 'light',
      reason: 'Proteína ya cubierta, elige algo ligero',
      confidence: 80,
    };
  }

  // 3️⃣ Si proteína < 60%, recomienda proteico (HIGH PRIORITY)
  if (percentages.protein.percentage < 60) {
    return {
      type: 'high-protein',
      reason: 'Te falta bastante proteína, necesitas una opción proteica',
      confidence: 95,
    };
  }

  // 4️⃣ Si macros están balanceados ±10%, recomienda balanceado
  const { isBalanced } = calculateMacroBalance(remaining);
  if (isBalanced && remaining['carbs'] > 0) {
    return {
      type: 'balanced',
      reason: 'Tus macros están balanceados, mantén el equilibrio',
      confidence: 90,
    };
  }

  // 5️⃣ Si estás cerca de exceder calorías, recomienda ligero
  if (caloriesRemaining < 300) {
    return {
      type: 'light',
      reason: 'Cuidado con las calorías, elige algo ligero',
      confidence: 85,
    };
  }

  // 6️⃣ Por defecto: analiza el macro más bajo
  const lowestMacro = findLowestMacro(remaining);
  switch (lowestMacro) {
    case 'protein':
      return {
        type: 'high-protein',
        reason: 'Proteína es tu macro más necesario',
        confidence: 75,
      };
    case 'carbs':
      return {
        type: 'balanced',
        reason: 'Enfócate en aumentar tus carbohidratos',
        confidence: 75,
      };
    default:
      return {
        type: 'balanced',
        reason: 'Una opción balanceada es lo mejor ahora',
        confidence: 70,
      };
  }
}

/**
 * Genera feedback amigable sobre la recomendación
 */
export function generateRecommendationFeedback(
  recommended: MealRecommendation,
  percentages: MacroPercentages
): RecommendationFeedback {
  const typeNames: Record<MealDecision, string> = {
    'light': 'ligero',
    'balanced': 'balanceado',
    'high-protein': 'proteico',
  };

  const typeName = typeNames[recommended.type];

  if (recommended.confidence >= 90) {
    return {
      message: `🎯 Recomendación fuerte: considera una comida ${typeName}. ${recommended.reason}`,
      type: 'warning',
    };
  }

  if (recommended.confidence >= 75) {
    return {
      message: `💡 Sugerencia: una opción ${typeName} te vendría bien. ${recommended.reason}`,
      type: 'info',
    };
  }

  return {
    message: `📊 Puedes elegir ${typeName}. ${recommended.reason}`,
    type: 'success',
  };
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
        const meals = store.meals() ?? [];
        return calculateConsumedMacros(meals.filter((m: any) => m.status === 'completed'));
      }),

      // Macros restantes para el día
      remainingMacros: computed(() => {
        const consumed = calculateConsumedMacros(store.meals() ?? []);
        const goals = store.dailyGoals();

        return {
          protein: Math.max(goals.protein - consumed.protein, 0),
          fats: Math.max(goals.fats - consumed.fats, 0),
          carbs: Math.max(goals.carbs - consumed.carbs, 0),
        };
      }),

      // Porcentajes de cada macro
      macroPercentages: computed(() => {
        const consumed = calculateConsumedMacros(store.meals() ?? []);
        const goals = store.dailyGoals();
        return calculateAllMacroPercentages(consumed, goals);
      }),

      // Mensajes dinámicos para el usuario
      macroMessages: computed(() => {
        const consumed = calculateConsumedMacros(store.meals() ?? []);
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
        const mealsFromEngine = store.meals() ?? [];
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

      // 🧠 RECOMMENDATION ENGINE - Recomendación global de tipo de comida
      recommendedMealType: computed(() => {
        // Calcular consumed macros directamente
        const meals = store.meals() ?? [];
        const consumed = calculateConsumedMacros(meals);
        const dailyGoal = store.dailyGoals();
        
        // Calcular percentages directamente
        const percentages = calculateAllMacroPercentages(consumed, dailyGoal);
        
        // Calcular remaining
        const remaining = {
          protein: Math.max(dailyGoal.protein - consumed.protein, 0),
          carbs: Math.max(dailyGoal.carbs - consumed.carbs, 0),
          fats: Math.max(dailyGoal.fats - consumed.fats, 0),
        };
        
        // Calcular total calories
        const totalCals = meals.reduce((total: number, meal: any) => {
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
      }),

      // 💬 RECOMMENDATION ENGINE - Feedback amigable sobre recomendación
      feedbackMessage: computed(() => {
        // Calcular consumed macros directamente
        const meals = store.meals() ?? [];
        const consumed = calculateConsumedMacros(meals);
        const dailyGoal = store.dailyGoals();
        
        // Calcular percentages directamente
        const percentages = calculateAllMacroPercentages(consumed, dailyGoal);
        
        // Calcular remaining para la recomendación
        const remaining = {
          protein: Math.max(dailyGoal.protein - consumed.protein, 0),
          carbs: Math.max(dailyGoal.carbs - consumed.carbs, 0),
          fats: Math.max(dailyGoal.fats - consumed.fats, 0),
        };
        
        // Calcular total calories
        const totalCals = meals.reduce((total: number, meal: any) => {
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

        // Obtener recomendación
        const recommended = calculateMealRecommendation(
          percentages,
          remaining,
          totalCals,
          dailyGoal
        );
        
        // Generar feedback
        return generateRecommendationFeedback(recommended, percentages);
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

      /**
       * 🧠 Obtiene la recomendación de tipo de comida para una comida específica
       * Usa los macros globales restantes para calcular qué tipo de comida sería mejor
       * Se actualiza automáticamente cuando cambian los macros consumidos
       */
      getMealRecommendation(mealId: string): MealRecommendation {
        // Validar que el mealId exista
        const meal = store.meals()?.find((m: any) => m.id === mealId);
        if (!meal) {
          // Si no existe, retorna recomendación por defecto
          return {
            type: 'balanced',
            reason: 'Comida no encontrada',
            confidence: 0,
          };
        }

        // Usar la recomendación global (que ya es reactiva)
        return store.recommendedMealType();
      },
    }))
  );
}
