export type FoodDialogDiet = {
  id: string;
  name: string;
  estimateLocation: string;
  exactLocation?: string;
};

export type FoodDescriptionDialogData = {
  diet?: FoodDialogDiet;
};

export type NutrientAmount = { amount?: number; unit?: string };

export type FoodNutritionData = {
  calories?: NutrientAmount;
  protein?: NutrientAmount;
  fat?: NutrientAmount;
  carbs?: NutrientAmount;
  fiber?: NutrientAmount;
  sugar?: NutrientAmount;
  iron?: NutrientAmount;
  calcium?: NutrientAmount;
  potassium?: NutrientAmount;
  vitaminC?: NutrientAmount;
  vitaminA?: NutrientAmount;
  vitaminD?: NutrientAmount;
};

export type FoodDescriptionState = {
  foodName: string;
  foodData: FoodNutritionData | null;
  isDetailed: boolean;
  isLoading: boolean;
};

export type GuessNutritionResponse = {
  calories?: { value?: number; unit?: string };
  protein?: { value?: number; unit?: string };
  fat?: { value?: number; unit?: string };
  carbs?: { value?: number; unit?: string };
};

export type IngredientSearchResponse = {
  results?: Array<{ id?: number }>;
};

export type IngredientInfoResponse = {
  nutrition?: {
    nutrients?: Array<{ name?: string; amount?: number; unit?: string }>;
  };
};