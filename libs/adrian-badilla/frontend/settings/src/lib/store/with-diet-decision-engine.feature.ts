import {
  signalStoreFeature,
  withState,
  withComputed,
  withMethods,
  patchState
} from '@ngrx/signals';
import { computed } from '@angular/core';
import { MOCK_MEALS } from '../mocks/diet-decision.mock';

function getMacrosByDecision(decision: string) {
  switch (decision) {
    case 'high-protein':
      return { protein: 35, carbs: 20, fats: 10 };
    case 'light':
      return { protein: 10, carbs: 15, fats: 5 };
    default:
      return { protein: 20, carbs: 30, fats: 10 };
  }
}

function adjustRemainingMealsFn(store: any) {
  const remaining = store.remainingMacros();

  const updated = store.meals().map((m: any) => {
    if (m.status !== 'pending') return m;

    if (remaining.protein > 40) {
      return {
        ...m,
        macros: {
          ...m.macros,
          protein: m.macros.protein + 10
        }
      };
    }

    return m;
  });

  patchState(store, { meals: updated });
}

export function withDietDecisionEngine() {
  return signalStoreFeature(
    // 🧠 STATE
    withState(() => ({
      meals: MOCK_MEALS,
      dailyGoal: {
        protein: 120,
        carbs: 200,
        fats: 60
      }
    })),

    // ⚡ COMPUTED
withComputed((store) => ({
  consumedMacros: computed(() => {
    return store.meals().reduce(
      (acc, meal) => {
        if (meal.status === 'completed') {
          acc.protein += meal.macros.protein;
          acc.carbs += meal.macros.carbs;
          acc.fats += meal.macros.fats;
        }
        return acc;
      },
      { protein: 0, carbs: 0, fats: 0 }
    );
  })
})),

withComputed((store) => ({
  remainingMacros: computed(() => {
    const consumed = store.consumedMacros(); // ✅ ahora sí existe
    const goal = store.dailyGoal();

    return {
      protein: goal.protein - consumed.protein,
      carbs: goal.carbs - consumed.carbs,
      fats: goal.fats - consumed.fats
    };
  })
})),

    // 🛠 METHODS
    withMethods((store) => ({
      updateMealStatus(mealId: string, status: any) {
        const updated = store.meals().map((m) =>
          m.id === mealId ? { ...m, status } : m
        );

        patchState(store, { meals: updated });
      },

      applyDecision(mealId: string, decision: any) {
        const updated = store.meals().map((m) => {
          if (m.id === mealId) {
            return {
              ...m,
              decision,
              macros: getMacrosByDecision(decision)
            };
          }
          return m;
        });

        patchState(store, { meals: updated });

        adjustRemainingMealsFn(store);
      },

      adjustRemainingMeals() {
        const remaining = store.remainingMacros();

        const updated = store.meals().map((m) => {
          if (m.status !== 'pending') return m;

          if (remaining.protein > 40) {
            return {
              ...m,
              macros: {
                ...m.macros,
                protein: m.macros.protein + 10
              }
            };
          }

          return m;
        });

        patchState(store, { meals: updated });
      }
    }))
  );
}