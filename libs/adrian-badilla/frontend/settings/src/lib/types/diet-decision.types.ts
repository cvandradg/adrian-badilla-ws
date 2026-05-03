export type MealStatus = 'pending' | 'completed' | 'skipped';

// 🃏 TYPED METADATA — each domain provides its own shape
export type MealMetadata = {
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
};

export type RoutineMetadata = {
  exercises: string[];
};

export type DecisionMetadata = MealMetadata | RoutineMetadata;

// 🃏 GENERIC DECISION ITEM — used by DecisionCardComponent
export interface DecisionItem {
  id: string;
  title: string;
  subtitle?: string;
  /** Optional day label — e.g. 'Monday'. Base for multi-day timeline support. */
  day?: string;
  status: MealStatus;
  metadata?: DecisionMetadata;
}

// ─── Type guards ──────────────────────────────────────────────────────────────

export function isMealMetadata(meta: DecisionMetadata | undefined): meta is MealMetadata {
  return !!meta && 'macros' in meta;
}

export function isRoutineMetadata(meta: DecisionMetadata | undefined): meta is RoutineMetadata {
  return !!meta && 'exercises' in meta;
}

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
  isRecommended?: boolean; // ✨ Badge para sugerencias integradas
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

// 🧠 RECOMMENDATION ENGINE TYPES
/**
 * MealRecommendation interface
 * Meal types:
 * 'light' = ligero
 * 'balanced' = balanceado
 * 'high-protein' = proteico
 */
export interface MealRecommendation {
  type: MealDecision;
  reason: string;
  confidence: number; // 0-100, higher = more confident
}

export interface RecommendationFeedback {
  message: string;
  type: 'success' | 'info' | 'warning';
}

// 🍽️ MEAL SUGGESTION TYPES
export interface FoodBlock extends MealOption {
  category?: 'protein' | 'carbs' | 'fats' | 'mixed';
  servingSize?: string; // e.g., "100g", "1 egg", "1 tbsp"
}

export interface SuggestedMeal {
  items: FoodBlock[];
  totals: MealMacro;
  nearestMatch: string; // descriptor de qué tan cerca estuvo
}