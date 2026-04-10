export type MealStatus = 'pending' | 'completed' | 'skipped';

export type MealDecision =
  | 'light'
  | 'balanced'
  | 'high-protein';

export interface MealMacro {
  protein: number;
  carbs: number;
  fats: number;
}

export interface MealOption {
  name: string;
  macros: MealMacro;
}

export interface DietMeal {
  id: string;
  name: string;
  baseName: string;
  time: string;
  status: MealStatus;
  decision?: MealDecision;
  selectedFoodName?: string | null;
  decisionOptions?: Partial<Record<MealDecision, MealOption[]>>;
  macros: MealMacro;
}