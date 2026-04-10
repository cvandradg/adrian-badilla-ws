import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@adrian-badilla/ui/shared';
import type {
  FoodDescriptionDialogData,
  FoodDescriptionState,
  FoodNutritionData,
  GuessNutritionResponse,
  IngredientInfoResponse,
  IngredientSearchResponse,
} from '../types/food-description.types';

const DETAILED_NUTRIENT_KEYS: Record<keyof FoodNutritionData, string> = {
  calories: 'Calories',
  protein: 'Protein',
  fat: 'Fat',
  carbs: 'Carbohydrates',
  fiber: 'Fiber',
  sugar: 'Sugar',
  iron: 'Iron',
  calcium: 'Calcium',
  potassium: 'Potassium',
  vitaminC: 'Vitamin C',
  vitaminA: 'Vitamin A',
  vitaminD: 'Vitamin D',
};

function mapGuessNutrition(response: GuessNutritionResponse): FoodNutritionData {
  return {
    calories: {
      amount: response.calories?.value,
      unit: response.calories?.unit || 'kcal',
    },
    protein: {
      amount: response.protein?.value,
      unit: response.protein?.unit || 'g',
    },
    fat: {
      amount: response.fat?.value,
      unit: response.fat?.unit || 'g',
    },
    carbs: {
      amount: response.carbs?.value,
      unit: response.carbs?.unit || 'g',
    },
  };
}

function mapDetailedNutrition(
  nutrients: Array<{ name?: string; amount?: number; unit?: string }>,
): FoodNutritionData {
  const nutrientsByName = new Map(
    nutrients
      .filter(
        (
          nutrient,
        ): nutrient is { name: string; amount?: number; unit?: string } =>
          !!nutrient.name,
      )
      .map((nutrient) => [nutrient.name, nutrient] as const),
  );

  return (Object.keys(DETAILED_NUTRIENT_KEYS) as Array<keyof FoodNutritionData>).reduce(
    (acc, key) => {
      const nutrient = nutrientsByName.get(DETAILED_NUTRIENT_KEYS[key]);
      acc[key] = nutrient
        ? {
            amount: nutrient.amount,
            unit: nutrient.unit,
          }
        : undefined;
      return acc;
    },
    {} as FoodNutritionData,
  );
}

export function withFoodDescription() {
  const http = inject(HttpClient);
  const apiKey = environment.spoonacular.appKey;

  return signalStoreFeature(
    withState<FoodDescriptionState>({
      foodName: 'chicken breast',
      foodData: null,
      isDetailed: false,
      isLoading: false,
    }),

    withComputed((store) => ({
      hasFoodData: computed(() => store.foodData() !== null),
      canLoadDetails: computed(
        () => !store.isLoading() && store.foodData() !== null && !store.isDetailed(),
      ),
      hasError: computed(() => !store.isLoading() && store.foodData() === null),
    })),

    withComputed((store) => ({
      foodDescriptionVm: computed(() => ({
        foodName: store.foodName(),
        foodData: store.foodData(),
        isDetailed: store.isDetailed(),
        isLoading: store.isLoading(),
        hasFoodData: store.hasFoodData(),
        canLoadDetails: store.canLoadDetails(),
        hasError: store.hasError(),
      })),
    })),

    withMethods((store) => ({
      initializeFoodDescriptionDialog: async (
        dialogData?: FoodDescriptionDialogData,
      ) => {
        const estimatedName = dialogData?.diet?.estimateLocation || 'chicken breast';
        const exactName = dialogData?.diet?.exactLocation || estimatedName;

        patchState(store, {
          foodName: estimatedName,
          foodData: null,
          isDetailed: false,
          isLoading: true,
        });

        try {
          const response = await firstValueFrom(
            http.get<GuessNutritionResponse>(
              'https://api.spoonacular.com/recipes/guessNutrition',
              {
                params: {
                  title: exactName,
                  apiKey,
                },
              },
            ),
          );

          patchState(store, {
            foodData: mapGuessNutrition(response),
            isLoading: false,
          });
        } catch {
          patchState(store, { foodData: null, isLoading: false });
        }
      },

      loadFullFoodDescription: async () => {
        const query = store.foodName();
        patchState(store, { isLoading: true });

        try {
          const searchResponse = await firstValueFrom(
            http.get<IngredientSearchResponse>(
              'https://api.spoonacular.com/food/ingredients/search',
              {
                params: {
                  query,
                  apiKey,
                },
              },
            ),
          );

          const ingredientId = searchResponse.results?.[0]?.id;

          if (!ingredientId) {
            patchState(store, { isLoading: false });
            return;
          }

          const infoResponse = await firstValueFrom(
            http.get<IngredientInfoResponse>(
              `https://api.spoonacular.com/food/ingredients/${ingredientId}/information`,
              {
                params: {
                  amount: 1,
                  unit: 'piece',
                  apiKey,
                },
              },
            ),
          );

          const nutrients = infoResponse?.nutrition?.nutrients || [];

          patchState(store, {
            foodData: mapDetailedNutrition(nutrients),
            isDetailed: true,
            isLoading: false,
          });
        } catch {
          patchState(store, { isLoading: false });
        }
      },
    })),
  );
}
