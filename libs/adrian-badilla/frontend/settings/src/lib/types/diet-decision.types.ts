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

// 📊 MACRO TRACKER TYPES
export interface MacroGoals {
  protein: number;
  fats: number;
  carbs: number;
}

export interface MacroPercentage {
  percentage: number; // 0-100+
  remaining: number; // gramos restantes
  exceeded: number; // gramos que se pasó si es el caso
  isCompleted: boolean;
}

export interface MacroMessage {
  macro: 'protein' | 'fats' | 'carbs' | 'overall';
  text: string;
  type: 'success' | 'info' | 'warning';
}

export interface MacroSnapshot {
  goals: MacroGoals;
  consumed: {
    protein: number;
    fats: number;
    carbs: number;
  };
  remaining: {
    protein: number;
    fats: number;
    carbs: number;
  };
  percentages: {
    protein: MacroPercentage;
    fats: MacroPercentage;
    carbs: MacroPercentage;
    average: MacroPercentage;
  };
  messages: MacroMessage[];
  isAllComplete: boolean;
  completedCount: number;
}