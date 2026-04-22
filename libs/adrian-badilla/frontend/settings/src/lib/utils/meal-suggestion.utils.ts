import { MealOption, MealMacro } from '../types/diet-decision.types';

/**
 * 🥗 FOOD BLOCKS
 * Bloques de alimentos clasificados por tipo y macronutrientes
 */

/** Meal category or time-of-day slot */
export type MealCategory =
  | 'breakfast'
  | 'morning-snack'
  | 'lunch'
  | 'afternoon-snack'
  | 'dinner'
  | 'night-snack';

export interface FoodBlock extends MealOption {
  category?: 'protein' | 'carbs' | 'fats' | 'mixed';
  servingSize?: string; // e.g., "100g", "1 egg", "1 tbsp"
  mealTags: MealCategory[]; // Required: valid meal slots for this food
}

export const FOOD_BLOCKS: FoodBlock[] = [
  // 🍗 PROTEÍNAS PRINCIPALES
  { name: 'Pollo (100g)', macros: { protein: 31, carbs: 0, fats: 3.6 }, category: 'protein', servingSize: '100g', mealTags: ['lunch', 'dinner'] },
  { name: 'Pechuga de pollo (100g)', macros: { protein: 31, carbs: 0, fats: 1.2 }, category: 'protein', servingSize: '100g', mealTags: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Atún en lata (100g)', macros: { protein: 29, carbs: 0, fats: 0.5 }, category: 'protein', servingSize: '100g', mealTags: ['lunch', 'dinner'] },
  { name: 'Carne magra (100g)', macros: { protein: 26, carbs: 0, fats: 5 }, category: 'protein', servingSize: '100g', mealTags: ['lunch', 'dinner'] },
  { name: 'Salmón (100g)', macros: { protein: 25, carbs: 0, fats: 11 }, category: 'mixed', servingSize: '100g', mealTags: ['lunch', 'dinner'] },
  { name: 'Huevo (1 unit)', macros: { protein: 6, carbs: 0.6, fats: 5 }, category: 'protein', servingSize: '1 unit', mealTags: ['breakfast', 'morning-snack'] },
  { name: 'Claras (3 units)', macros: { protein: 11, carbs: 1.1, fats: 0.2 }, category: 'protein', servingSize: '3 units', mealTags: ['breakfast', 'morning-snack', 'afternoon-snack'] },
  { name: 'Pavo (100g)', macros: { protein: 29, carbs: 0, fats: 1.5 }, category: 'protein', servingSize: '100g', mealTags: ['lunch', 'dinner'] },
  { name: 'Yogurt griego (100g)', macros: { protein: 10, carbs: 3.3, fats: 0.5 }, category: 'protein', servingSize: '100g', mealTags: ['breakfast', 'morning-snack', 'afternoon-snack', 'night-snack'] },
  { name: 'Cottage cheese (100g)', macros: { protein: 11, carbs: 3.4, fats: 4.3 }, category: 'protein', servingSize: '100g', mealTags: ['breakfast', 'morning-snack', 'afternoon-snack', 'night-snack'] },
  { name: 'Tofu (100g)', macros: { protein: 17, carbs: 1.9, fats: 8.8 }, category: 'protein', servingSize: '100g', mealTags: ['lunch', 'dinner'] },
  { name: 'Whey protein (30g)', macros: { protein: 24, carbs: 1, fats: 1 }, category: 'protein', servingSize: '30g', mealTags: ['breakfast', 'morning-snack', 'afternoon-snack'] },

  // 🍚 CARBOHIDRATOS PRINCIPALES
  { name: 'Arroz integral (100g cocido)', macros: { protein: 2.6, carbs: 23, fats: 0.9 }, category: 'carbs', servingSize: '100g', mealTags: ['lunch', 'dinner'] },
  { name: 'Arroz blanco (100g cocido)', macros: { protein: 2.7, carbs: 28, fats: 0.3 }, category: 'carbs', servingSize: '100g', mealTags: ['lunch', 'dinner'] },
  { name: 'Avena (100g seco)', macros: { protein: 10.7, carbs: 66, fats: 6.9 }, category: 'mixed', servingSize: '100g', mealTags: ['breakfast', 'morning-snack'] },
  { name: 'Papas dulces (100g cocido)', macros: { protein: 1.5, carbs: 20, fats: 0.1 }, category: 'carbs', servingSize: '100g', mealTags: ['lunch', 'dinner'] },
  { name: 'Papas blancas (100g cocido)', macros: { protein: 2, carbs: 17, fats: 0.1 }, category: 'carbs', servingSize: '100g', mealTags: ['lunch', 'dinner'] },
  { name: 'Pan integral (1 rebanada)', macros: { protein: 4, carbs: 12, fats: 1.5 }, category: 'carbs', servingSize: '1 slice', mealTags: ['breakfast', 'morning-snack'] },
  { name: 'Pan blanco (1 rebanada)', macros: { protein: 3, carbs: 14, fats: 1 }, category: 'carbs', servingSize: '1 slice', mealTags: ['breakfast', 'morning-snack'] },
  { name: 'Pasta integral (100g cocida)', macros: { protein: 4, carbs: 26, fats: 0.5 }, category: 'carbs', servingSize: '100g', mealTags: ['lunch', 'dinner'] },
  { name: 'Lentejas (100g cocidas)', macros: { protein: 9, carbs: 20, fats: 0.4 }, category: 'mixed', servingSize: '100g', mealTags: ['lunch', 'dinner'] },
  { name: 'Avena (50g seco)', macros: { protein: 5.35, carbs: 33, fats: 3.45 }, category: 'carbs', servingSize: '50g', mealTags: ['breakfast', 'morning-snack'] },
  { name: 'Plátano (1 unit)', macros: { protein: 1.1, carbs: 27, fats: 0.3 }, category: 'carbs', servingSize: '1 unit', mealTags: ['breakfast', 'morning-snack', 'afternoon-snack'] },
  { name: 'Manzana (1 unit)', macros: { protein: 0.3, carbs: 25, fats: 0.2 }, category: 'carbs', servingSize: '1 unit', mealTags: ['breakfast', 'morning-snack', 'afternoon-snack'] },

  // 🥑 GRASAS
  { name: 'Aguacate (100g)', macros: { protein: 2, carbs: 9, fats: 15 }, category: 'fats', servingSize: '100g', mealTags: ['lunch', 'dinner'] },
  { name: 'Aceite de oliva (1 tbsp)', macros: { protein: 0, carbs: 0, fats: 14 }, category: 'fats', servingSize: '1 tbsp', mealTags: ['lunch', 'dinner'] },
  { name: 'Almendras (30g)', macros: { protein: 6, carbs: 6, fats: 14 }, category: 'mixed', servingSize: '30g', mealTags: ['morning-snack', 'afternoon-snack', 'night-snack'] },
  { name: 'Mantequilla de maní (2 tbsp)', macros: { protein: 8, carbs: 7, fats: 16 }, category: 'mixed', servingSize: '2 tbsp', mealTags: ['breakfast', 'morning-snack', 'afternoon-snack'] },
  { name: 'Frutos secos mix (30g)', macros: { protein: 5, carbs: 8, fats: 14 }, category: 'mixed', servingSize: '30g', mealTags: ['morning-snack', 'afternoon-snack', 'night-snack'] },
  { name: 'Nueces (30g)', macros: { protein: 4, carbs: 4, fats: 20 }, category: 'fats', servingSize: '30g', mealTags: ['morning-snack', 'afternoon-snack', 'night-snack'] },
  { name: 'Mantequilla (1 tbsp)', macros: { protein: 0.1, carbs: 0, fats: 11 }, category: 'fats', servingSize: '1 tbsp', mealTags: ['lunch', 'dinner'] },
  { name: 'Coco (30g)', macros: { protein: 3, carbs: 3, fats: 27 }, category: 'fats', servingSize: '30g', mealTags: ['afternoon-snack', 'night-snack'] },

  // 🥬 VEGETALES (LOW CARB)
  { name: 'Brócoli (100g cocido)', macros: { protein: 2.8, carbs: 7, fats: 0.4 }, category: 'carbs', servingSize: '100g', mealTags: ['lunch', 'dinner'] },
  { name: 'Espinaca (100g cocida)', macros: { protein: 2.7, carbs: 3.6, fats: 0.4 }, category: 'carbs', servingSize: '100g', mealTags: ['lunch', 'dinner'] },
  { name: 'Lechuga (100g)', macros: { protein: 1.2, carbs: 2.9, fats: 0.3 }, category: 'carbs', servingSize: '100g', mealTags: ['lunch', 'dinner'] },
  { name: 'Tomate (100g)', macros: { protein: 0.9, carbs: 3.9, fats: 0.2 }, category: 'carbs', servingSize: '100g', mealTags: ['lunch', 'dinner'] },
  { name: 'Zanahoria (100g cocida)', macros: { protein: 0.9, carbs: 10, fats: 0.2 }, category: 'carbs', servingSize: '100g', mealTags: ['lunch', 'dinner'] },

  // 🍯 CARBOS REFINADOS (Occasional)
  { name: 'Miel (1 tbsp)', macros: { protein: 0.3, carbs: 17, fats: 0 }, category: 'carbs', servingSize: '1 tbsp', mealTags: ['breakfast', 'morning-snack'] },
  { name: 'Granola (50g)', macros: { protein: 12, carbs: 45, fats: 15 }, category: 'mixed', servingSize: '50g', mealTags: ['breakfast', 'morning-snack'] },

  // 🔒 COMIDAS DE SEGURIDAD - Versiones muy pequeñas para últimos macros
  { name: 'Pollo (50g)', macros: { protein: 15.5, carbs: 0, fats: 1.8 }, category: 'protein', servingSize: '50g', mealTags: ['lunch', 'dinner'] },
  { name: 'Pechuga de pollo (50g)', macros: { protein: 15.5, carbs: 0, fats: 0.6 }, category: 'protein', servingSize: '50g', mealTags: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Atún en lata (50g)', macros: { protein: 14.5, carbs: 0, fats: 0.25 }, category: 'protein', servingSize: '50g', mealTags: ['lunch', 'dinner'] },
  { name: 'Claras (1-2 units)', macros: { protein: 4, carbs: 0.4, fats: 0.1 }, category: 'protein', servingSize: '1-2 units', mealTags: ['breakfast', 'morning-snack', 'afternoon-snack'] },
  { name: 'Huevo (1/2 unit)', macros: { protein: 3, carbs: 0.3, fats: 2.5 }, category: 'protein', servingSize: '1/2 unit', mealTags: ['breakfast', 'morning-snack'] },
  { name: 'Yogurt griego (50g)', macros: { protein: 5, carbs: 1.65, fats: 0.25 }, category: 'protein', servingSize: '50g', mealTags: ['breakfast', 'morning-snack', 'afternoon-snack', 'night-snack'] },
  { name: 'Cottage cheese (50g)', macros: { protein: 5.5, carbs: 1.7, fats: 2.15 }, category: 'protein', servingSize: '50g', mealTags: ['breakfast', 'morning-snack', 'afternoon-snack', 'night-snack'] },
  
  // Carbos pequeños de seguridad
  { name: 'Arroz integral (50g cocido)', macros: { protein: 1.3, carbs: 11.5, fats: 0.45 }, category: 'carbs', servingSize: '50g', mealTags: ['lunch', 'dinner'] },
  { name: 'Papas dulces (50g cocido)', macros: { protein: 0.75, carbs: 10, fats: 0.05 }, category: 'carbs', servingSize: '50g', mealTags: ['lunch', 'dinner'] },
  { name: 'Papas blancas (50g cocido)', macros: { protein: 1, carbs: 8.5, fats: 0.05 }, category: 'carbs', servingSize: '50g', mealTags: ['lunch', 'dinner'] },
  { name: 'Pan integral (1/2 rebanada)', macros: { protein: 2, carbs: 6, fats: 0.75 }, category: 'carbs', servingSize: '1/2 slice', mealTags: ['breakfast', 'morning-snack'] },
  { name: 'Manzana (1/2 unit)', macros: { protein: 0.15, carbs: 12.5, fats: 0.1 }, category: 'carbs', servingSize: '1/2 unit', mealTags: ['breakfast', 'morning-snack', 'afternoon-snack'] },
  
  // Grasas de seguridad
  { name: 'Almendras (15g)', macros: { protein: 3, carbs: 3, fats: 7 }, category: 'mixed', servingSize: '15g', mealTags: ['morning-snack', 'afternoon-snack', 'night-snack'] },
  { name: 'Aceite de oliva (1/2 tbsp)', macros: { protein: 0, carbs: 0, fats: 7 }, category: 'fats', servingSize: '1/2 tbsp', mealTags: ['lunch', 'dinner'] },
  { name: 'Aguacate (50g)', macros: { protein: 1, carbs: 4.5, fats: 7.5 }, category: 'fats', servingSize: '50g', mealTags: ['lunch', 'dinner'] },
];

/**
 * 🍽️ ALIMENTOS PREFERIDOS POR CATEGORÍA
 * Esto asegura variedad en las sugerencias
 */
const PREFERRED_FOODS_BY_CATEGORY = {
  breakfast: [
    'Claras (3 units)',
    'Huevo (1 unit)',
    'Yogurt griego (100g)',
    'Pan integral (1 rebanada)',
    'Plátano (1 unit)',
    'Manzana (1 unit)',
    'Whey protein (30g)',
    'Cottage cheese (100g)',
    'Pechuga de pollo (100g)',
    'Pollo (100g)',
    'Lentejas (100g cocidas)',
    'Avena (50g seco)',
  ],
  'morning-snack': [
    'Yogurt griego (100g)',
    'Plátano (1 unit)',
    'Manzana (1 unit)',
    'Claras (3 units)',
    'Cottage cheese (100g)',
    'Nueces (30g)',
    'Whey protein (30g)',
    'Almendras (30g)',
    'Frutos secos mix (30g)',
  ],
  lunch: [
    'Pollo (100g)',
    'Pechuga de pollo (100g)',
    'Salmón (100g)',
    'Atún en lata (100g)',
    'Carne magra (100g)',
    'Pavo (100g)',
    'Tofu (100g)',
    'Arroz integral (100g cocido)',
    'Arroz blanco (100g cocido)',
    'Papas dulces (100g cocido)',
    'Papas blancas (100g cocido)',
    'Brócoli (100g cocido)',
    'Espinaca (100g cocida)',
    'Aguacate (100g)',
    'Lentejas (100g cocidas)',
    'Pasta integral (100g cocida)',
  ],
  'afternoon-snack': [
    'Almendras (30g)',
    'Frutos secos mix (30g)',
    'Mantequilla de maní (2 tbsp)',
    'Yogurt griego (100g)',
    'Cottage cheese (100g)',
    'Manzana (1 unit)',
    'Plátano (1 unit)',
    'Nueces (30g)',
    'Whey protein (30g)',
    'Claras (3 units)',
  ],
  dinner: [
    'Pechuga de pollo (100g)',
    'Atún en lata (100g)',
    'Pavo (100g)',
    'Salmón (100g)',
    'Pollo (100g)',
    'Claras (3 units)',
    'Tofu (100g)',
    'Carne magra (100g)',
    'Espinaca (100g cocida)',
    'Brócoli (100g cocido)',
    'Lechuga (100g)',
    'Tomate (100g)',
    'Zanahoria (100g cocida)',
  ],
  'night-snack': [
    'Cottage cheese (100g)',
    'Yogurt griego (100g)',
    'Claras (3 units)',
    'Almendras (30g)',
    'Nueces (30g)',
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 🧮 ENGINE DE SUGERENCIAS v2 — Soft-constraint, calorie-aware, signal-ready
// ─────────────────────────────────────────────────────────────────────────────

// ─── Exported Types ───────────────────────────────────────────────────────────

export interface SuggestedMeal {
  items: FoodBlock[];
  totals: MealMacro;
  nearestMatch: string;
  /** 0–1 realism score (1 = very realistic meal, 0 = poor combination) */
  realismScore?: number;
}

/**
 * Defines a realistic meal structure by listing the expected macro categories
 * of each food item in the combination.
 */
export interface MealTemplate {
  name: string;
  structure: ('protein' | 'carbs' | 'fats' | 'mixed')[];
}

/** Meal decision modes used by the recommendation engine */
export type DecisionMode = 'light' | 'balanced' | 'protein';

/** Internal scoring context passed through the pipeline */
interface ScoringContext {
  remaining: MealMacro;
  decision?: DecisionMode;
}

// ─── Meal Templates ───────────────────────────────────────────────────────────
/**
 * Realistic meal structures used to guide 3-item combination generation.
 * Mixed-category foods are treated as wildcards in template matching.
 */
const MEAL_TEMPLATES: MealTemplate[] = [
  { name: 'balanced',           structure: ['protein', 'carbs', 'fats']   },
  { name: 'protein-carb',       structure: ['protein', 'carbs']           },
  { name: 'protein-fat',        structure: ['protein', 'fats']            },
  { name: 'mixed-carb',         structure: ['mixed', 'carbs']             },
  { name: 'mixed-protein',      structure: ['mixed', 'protein']           },
  { name: 'protein-carb-mixed', structure: ['protein', 'carbs', 'mixed']  },
  { name: 'protein-carb-carb',  structure: ['protein', 'carbs', 'carbs']  },
  { name: 'mixed-carb-protein', structure: ['mixed', 'carbs', 'protein']  },
];

// ─── Pure Helpers ─────────────────────────────────────────────────────────────

/** Total calories: protein×4 + carbs×4 + fats×9 */
function calcCalories(macros: MealMacro): number {
  return macros.protein * 4 + macros.carbs * 4 + macros.fats * 9;
}

/** "Avena (100g seco)" → "avena" */
function getBaseFoodName(foodName: string): string {
  return foodName.split('(')[0].trim().toLowerCase();
}

/** Prevents combining two servings of the same base food (e.g. Avena 100g + Avena 50g) */
function hasBaseFoodDuplicate(foods: FoodBlock[], newFood: FoodBlock): boolean {
  const newBase = getBaseFoodName(newFood.name);
  return foods.some((f) => getBaseFoodName(f.name) === newBase);
}

/** Builds a SuggestedMeal by summing macro totals across items */
function makeMeal(items: FoodBlock[]): SuggestedMeal {
  return {
    items,
    totals: items.reduce(
      (acc, f) => ({
        protein: acc.protein + f.macros.protein,
        carbs:   acc.carbs   + f.macros.carbs,
        fats:    acc.fats    + f.macros.fats,
      }),
      { protein: 0, carbs: 0, fats: 0 },
    ),
    nearestMatch: '',
  };
}

// ─── Dynamic Macro Weights ────────────────────────────────────────────────────

/**
 * 🎯 DYNAMIC MACRO WEIGHTS — Post-protein / post-carb / post-fat mode
 *
 * When a macro is already fulfilled (remaining ≤ 0) its weight drops to 0.05
 * so the engine naturally pivots to filling the remaining macros instead of
 * continuing to optimise for the completed one.
 *
 * Decision overrides take precedence over the dynamic mode.
 */
function getDynamicMacroWeights(
  remaining: MealMacro,
  decision?: DecisionMode,
): { protein: number; carbs: number; fats: number } {
  if (decision === 'protein') {
    return { protein: 0.65, carbs: 0.2, fats: 0.15 };
  }
  if (decision === 'light') {
    return { protein: 0.3, carbs: 0.4, fats: 0.3 };
  }

  // Dynamic balanced — deprioritise fulfilled macros
  const pw = remaining.protein <= 0 ? 0.05 : 0.4;
  const cw = remaining.carbs   <= 0 ? 0.05 : 0.35;
  const fw = remaining.fats    <= 0 ? 0.05 : 0.25;
  const total = pw + cw + fw;
  return { protein: pw / total, carbs: cw / total, fats: fw / total };
}

// ─── Macro Priority ───────────────────────────────────────────────────────────

/**
 * 📊 MACRO PRIORITY
 * Returns the proportional importance of each macro based on what is still
 * needed today.  The macro with the largest remaining amount gets the highest
 * priority weight.  Fulfilled macros (≤ 0) receive zero priority.
 */
export function getMacroPriority(
  remaining: MealMacro,
): { protein: number; carbs: number; fats: number } {
  const total =
    Math.max(remaining.protein, 0) +
    Math.max(remaining.carbs,   0) +
    Math.max(remaining.fats,    0);

  if (total === 0) return { protein: 0, carbs: 0, fats: 0 };

  return {
    protein: Math.max(remaining.protein, 0) / total,
    carbs:   Math.max(remaining.carbs,   0) / total,
    fats:    Math.max(remaining.fats,    0) / total,
  };
}

/**
 * 🏆 MOST CRITICAL MACRO
 * Returns the single macro with the highest remaining need.
 * Useful for UI messaging: "Te faltan principalmente CARBOHIDRATOS"
 */
export function getMostCriticalMacro(
  remaining: MealMacro,
): 'protein' | 'carbs' | 'fats' {
  const pr = Math.max(remaining.protein, 0);
  const cr = Math.max(remaining.carbs,   0);
  const fr = Math.max(remaining.fats,    0);
  if (pr >= cr && pr >= fr) return 'protein';
  if (cr >= fr) return 'carbs';
  return 'fats';
}

// ─── Scoring Functions ────────────────────────────────────────────────────────

/**
 * 📊 SOFT MACRO DISTANCE (normalised, lower = better)
 *
 * For active macros (remaining > 0):
 *   overshoot → penalised 2×  (too much is worse than too little)
 *   undershoot → penalised 0.3×  (mild — partial fill is acceptable)
 *
 * For fulfilled macros (remaining ≤ 0):
 *   any addition receives a soft, proportional penalty
 *   NEVER hard-blocks the food — just discourages adding to a filled macro
 */
/**
 * Tiered deficit penalty:
 *  - overshoot (ratio ≥ 1)   → quadratic penalty, discourages excess
 *  - good match  (≥ 0.7)     → near-zero cost
 *  - weak match  (≥ 0.4)     → moderate cost
 *  - no contribution (< 0.4) → high penalty — food is irrelevant
 *  - fulfilled macro (rem ≤ 0) → soft proportional penalty
 */
function deficitPenalty(consumed: number, rem: number): number {
  if (rem > 0) {
    const ratio = consumed / rem;
    if (ratio >= 1)   return (ratio - 1) * 2; // overshoot
    if (ratio >= 0.7) return 0.1;             // good partial fill
    if (ratio >= 0.4) return 0.5;             // weak contribution
    return 1.5;                               // essentially irrelevant
  }
  // Fulfilled macro: small soft penalty proportional to amount added
  return consumed > 0 ? consumed / 10 : 0;
}

function softMacroDistance(
  meal: SuggestedMeal,
  remaining: MealMacro,
  weights: { protein: number; carbs: number; fats: number },
): number {
  return (
    deficitPenalty(meal.totals.protein, remaining.protein) * weights.protein +
    deficitPenalty(meal.totals.carbs,   remaining.carbs)   * weights.carbs   +
    deficitPenalty(meal.totals.fats,    remaining.fats)     * weights.fats
  );
}

/**
 * 🎯 MACRO CONTRIBUTION SCORE
 * Rewards meals that address the most critically missing macros.
 * Returns a negative number — higher raw contribution = lower (better) score.
 */
function getMacroContributionScore(
  meal: SuggestedMeal,
  priority: { protein: number; carbs: number; fats: number },
): number {
  const raw =
    meal.totals.protein * priority.protein +
    meal.totals.carbs   * priority.carbs   +
    meal.totals.fats    * priority.fats;
  return -raw / 100;
}

/**
 * 🔥 CALORIE PENALTY
 * Penalises meals that overshoot the remaining calorie budget by more than 15 %.
 */
function getCaloriePenalty(meal: SuggestedMeal, remaining: MealMacro): number {
  const remainingCals = calcCalories({
    protein: Math.max(0, remaining.protein),
    carbs:   Math.max(0, remaining.carbs),
    fats:    Math.max(0, remaining.fats),
  });
  if (remainingCals <= 0) return 0;
  const ratio = calcCalories(meal.totals) / remainingCals;
  if (ratio <= 1.15) return 0;
  if (ratio <= 1.5)  return (ratio - 1.15) * 0.5;
  return (ratio - 1) * 0.8;
}

/**
 * ✅ MEAL COHERENCE HELPERS
 */

/** Returns true if a food is "high-carb" — ≥25g carbs per serving. */
function isHighCarb(food: FoodBlock): boolean {
  return food.macros.carbs >= 25;
}

/**
 * Returns true if the item list matches at least one defined MEAL_TEMPLATE.
 * Mixed-category items act as wildcards — they satisfy any template slot.
 * Meals with ONLY mixed-category items are considered non-matching (unrealistic).
 */
function matchesAnyTemplate(items: FoodBlock[]): boolean {
  const catSet = new Set(items.map((i) => i.category ?? 'mixed'));
  
  // Mixed-only meals (all items have 'mixed' category) don't match realistic templates
  if (catSet.size === 1 && catSet.has('mixed')) return false;
  
  return MEAL_TEMPLATES.some((template) =>
    template.structure.every(
      (req) => catSet.has(req) || catSet.has('mixed'),
    ),
  );
}

/**
 * ✅ MEAL COHERENCE: hard-penalises illogical food pairings
 */
function isMealCoherent(items: FoodBlock[]): boolean {
  const names = items.map((i) => i.name.toLowerCase());

  const invalidPairs: [string, string][] = [
    ['atún', 'miel'],
    ['atun', 'miel'],
    ['pollo', 'miel'],
    ['carne', 'miel'],
    ['pavo', 'miel'],
    ['aceite de oliva', 'manzana'],
    ['mantequilla', 'atún'],
    // Cereal / sweet grains mixed with savoury proteins
    ['granola', 'pollo'],
    ['granola', 'atún'],
    ['granola', 'atun'],
    ['granola', 'pavo'],
    ['granola', 'carne'],
    ['granola', 'salmón'],
    ['granola', 'salmon'],
    // Avena (oats) with savoury proteins
    ['avena', 'pollo'],
    ['avena', 'atún'],
    ['avena', 'atun'],
    ['avena', 'pavo'],
    ['avena', 'carne'],
    ['avena', 'salmón'],
    ['avena', 'salmon'],
  ];

  for (const [food1, food2] of invalidPairs) {
    const has1 = names.some((n) => n.includes(food1));
    const has2 = names.some((n) => n.includes(food2));
    if (has1 && has2) return false;
  }

  return true;
}

/**
 * �️ MEAL REALISM PENALTY
 * Checks whether a combination matches a recognised meal template.
 * Mixed-category foods are treated as wildcards — no penalty when present.
 */
/** Returns the category repetition + fat/carb-only structural penalty. */
function getStructuralPenalty(
  cats: string[],
  catSet: Set<string>,
  hasMixed: boolean,
  itemCount: number,
): number {
  let p = 0;
  if (!hasMixed && catSet.size === 1 && itemCount >= 3) p += 0.3;
  if (!hasMixed && !catSet.has('protein') && catSet.has('fats') && catSet.has('carbs') && itemCount >= 3) p += 0.1;
  if (itemCount >= 3 && cats.filter((c) => c === 'carbs').length >= 2) p += 0.3;
  return p;
}

function getMealRealismPenalty(items: FoodBlock[]): number {
  if (items.length <= 1) return 0;

  const cats     = items.map((i) => i.category ?? 'mixed');
  const catSet   = new Set(cats);
  const hasMixed = catSet.has('mixed');

  // With category-driven selection, realism penalties are minimal
  // Keep only structural coherence checks
  let penalty = getStructuralPenalty(cats, catSet, hasMixed, items.length);

  // Diversity bonus: reward balanced macro composition
  if (catSet.has('protein') && catSet.has('carbs') && catSet.has('fats')) penalty -= 0.1;

  return Math.max(0, penalty);
}

/**
 * 🎯 DECISION-AWARE PENALTY
 * Applies extra scoring pressure to enforce the selected meal type.
 */
function getDecisionPenalty(
  meal: SuggestedMeal,
  decision?: DecisionMode,
): number {
  if (!decision || decision === 'balanced') return 0;

  const cals = calcCalories(meal.totals);

  if (decision === 'light') {
    const calPenalty = Math.max(0, (cals - 350) / 350) * 0.4;
    const fatPenalty = Math.max(0, (meal.totals.fats - 12) / 12) * 0.2;
    return calPenalty + fatPenalty;
  }

  if (decision === 'protein') {
    if (meal.totals.protein < 10) return 5;   // Effectively discard
    if (meal.totals.protein < 18) return 1.5; // Strong penalty
    const ratio = meal.totals.protein / Math.max(cals, 1);
    if (ratio < 0.28) return (0.28 - ratio) * 0.8;
  }

  return 0;
}

/**
 * 🔍 COMPOSITE SCORE  (lower = better)
 *
 * Components:
 *  1. Soft macro distance  — dynamic weights, post-protein/carb/fat aware
 *  2. Calorie penalty      — discourages overshooting the calorie budget
 *  3. Coherence penalty    — hard-excludes incoherent pairings (score += 10)
 *  4. Decision penalty     — enforces light / protein constraints
 *  5. Realism penalty      — discourages template mismatches
 *  6. Simplicity bonus     — slight preference for 1–2 item meals
 */
function scoreMeal(meal: SuggestedMeal, ctx: ScoringContext): number {
  const weights          = getDynamicMacroWeights(ctx.remaining, ctx.decision);
  const priority         = getMacroPriority(ctx.remaining);
  const coherencePenalty = isMealCoherent(meal.items) ? 0 : 10;
  return (
    softMacroDistance(meal, ctx.remaining, weights)  +
    getMacroContributionScore(meal, priority)         +
    getCaloriePenalty(meal, ctx.remaining)            +
    coherencePenalty                                  +
    getDecisionPenalty(meal, ctx.decision)            +
    getMealRealismPenalty(meal.items)
  );
}

// ─── Food Sorting ─────────────────────────────────────────────────────────────

/**
 * Sorts foods by how well they cover remaining macros.
 * Mixed-category foods receive only a modest 25 % reduction (not the old 70 %).
 * Uses the same dynamic weights as the scorer so sorting is context-aware.
 */
function sortByRelevance(
  foods: FoodBlock[],
  remaining: MealMacro,
  decision?: DecisionMode,
): FoodBlock[] {
  // Use priority-aware scoring: the macro with the largest deficit drives ranking
  const priority = getMacroPriority(remaining);
  return [...foods].sort((a, b) => {
    const score = (f: FoodBlock): number => {
      let s =
        f.macros.protein * priority.protein +
        f.macros.carbs   * priority.carbs   +
        f.macros.fats    * priority.fats;
      // Mixed foods: slight reduction to prefer more specific options when equal
      if (f.category === 'mixed') s *= 0.75;
      return s;
    };
    return score(b) - score(a);
  });
}

// ─── Candidate Generation ─────────────────────────────────────────────────────

/** Generates 1-item candidate meals from the top-ranked foods. */
function generateSingleItemCandidates(foods: FoodBlock[]): SuggestedMeal[] {
  const limit = Math.min(foods.length, 25);
  const meals: SuggestedMeal[] = [];
  for (let i = 0; i < limit; i++) {
    meals.push(makeMeal([foods[i]]));
  }
  return meals;
}

/** Generates 2-item candidate meals, skipping base-food duplicates. */
function generateDoubleItemCandidates(foods: FoodBlock[]): SuggestedMeal[] {
  const meals: SuggestedMeal[] = [];
  for (let i = 0; i < Math.min(foods.length, 22); i++) {
    for (let j = i + 1; j < Math.min(foods.length, 27); j++) {
      if (hasBaseFoodDuplicate([foods[i]], foods[j])) continue;
      meals.push(makeMeal([foods[i], foods[j]]));
    }
  }
  return meals;
}

/** Appends coherent 3-item meals built from foods[i] + foods[j] + foods[k] for all valid k. */
function appendCoherentTriples(
  foods: FoodBlock[],
  i: number,
  j: number,
  meals: SuggestedMeal[],
): void {
  for (let k = j + 1; k < Math.min(foods.length, 19); k++) {
    if (hasBaseFoodDuplicate([foods[i], foods[j]], foods[k])) continue;
    const meal = makeMeal([foods[i], foods[j], foods[k]]);
    if (isMealCoherent(meal.items)) meals.push(meal);
  }
}

/** Generates 3-item candidate meals, filtered for coherence. */
function generateTripleItemCandidates(foods: FoodBlock[]): SuggestedMeal[] {
  const meals: SuggestedMeal[] = [];
  for (let i = 0; i < Math.min(foods.length, 13); i++) {
    for (let j = i + 1; j < Math.min(foods.length, 16); j++) {
      if (hasBaseFoodDuplicate([foods[i]], foods[j])) continue;
      appendCoherentTriples(foods, i, j, meals);
    }
  }
  return meals;
}

/**
 * Generates all viable meal combinations up to maxItems.
 * Delegates to dedicated helpers to keep cognitive complexity low.
 */
function generateCandidates(
  foods: FoodBlock[],
  maxItems: number,
): SuggestedMeal[] {
  const meals = generateSingleItemCandidates(foods);
  if (maxItems >= 2 && foods.length >= 2) meals.push(...generateDoubleItemCandidates(foods));
  if (maxItems >= 3 && foods.length >= 3) meals.push(...generateTripleItemCandidates(foods));
  return meals;
}

// ─── Best Selection ───────────────────────────────────────────────────────────

/** Scores all candidates and returns the one with the lowest composite score. */
function selectBest(candidates: SuggestedMeal[], ctx: ScoringContext): SuggestedMeal {
  if (candidates.length === 0) {
    return { items: [], totals: { protein: 0, carbs: 0, fats: 0 }, nearestMatch: 'Sin opciones' };
  }

  const scored = candidates
    .map((meal) => ({ meal, score: scoreMeal(meal, ctx) }))
    .sort((a, b) => a.score - b.score);

  const best  = scored[0].meal;
  const score = scored[0].score;

  if (score >= 10) {
    best.nearestMatch = 'Sin opciones seguras';
  } else if (score < 0.15) {
    best.nearestMatch = '✅ Coincidencia perfecta';
  } else if (score < 0.35) {
    best.nearestMatch = '🎯 Muy cercana';
  } else if (score < 0.6) {
    best.nearestMatch = '👍 Buena aproximación';
  } else {
    best.nearestMatch = '📊 Aproximación';
  }

  // 0–1 realism indicator (1 = excellent, 0 = poor)
  best.realismScore = Math.max(0, Math.min(1, 1 - score / 2));

  return best;
}

// ─── Main Exported Functions ──────────────────────────────────────────────────

/**
 * 🎯 MAIN FUNCTION: generateSuggestedMeal
 *
 * Soft-constraint recommendation engine — NO hard macro blocking.
 * Uses dynamic weights to handle post-protein / post-carb / post-fat modes.
 *
 * Signal-ready: wrap in Angular's `computed()` for reactive meal suggestions:
 *   ```ts
 *   suggestedMeal = computed(() =>
 *     generateSuggestedMeal(store.remainingMacros(), FOOD_BLOCKS, 3, store.decisionMode())
 *   );
 *   ```
 *
 * @param remaining   Macros still needed today (negative values are treated as fulfilled)
 * @param foodBlocks  Available food catalog (defaults to FOOD_BLOCKS)
 * @param maxItems    Max items in the suggestion (1–4; internally capped at 3)
 * @param decision    Meal type context (light / balanced / protein)
 */
export function generateSuggestedMeal(
  remaining: MealMacro,
  foodBlocks: FoodBlock[] = FOOD_BLOCKS,
  maxItems: number = 4,
  decision?: DecisionMode,
): SuggestedMeal {
  // All macros fulfilled — nothing left to suggest
  if (remaining.protein <= 0 && remaining.carbs <= 0 && remaining.fats <= 0) {
    return { items: [], totals: { protein: 0, carbs: 0, fats: 0 }, nearestMatch: '✅ Macros completados' };
  }

  const ctx: ScoringContext = { remaining, decision };

  // ── Soft pre-filter ────────────────────────────────────────────────────────
  // CRITICAL: Never hard-block a food because a macro is fulfilled.
  // Only remove foods that would overshoot the calorie budget by more than 3×
  // and apply optional decision-specific pre-filters (still lenient).
  const targetCals = calcCalories({
    protein: Math.max(0, remaining.protein),
    carbs:   Math.max(0, remaining.carbs),
    fats:    Math.max(0, remaining.fats),
  });

  let foods = foodBlocks.filter((food) => {
    const foodCals = calcCalories(food.macros);
    // Skip foods that would massively overshoot the calorie budget
    if (targetCals > 50 && foodCals > targetCals * 3) return false;

    // Decision-specific pre-filters (lenient — scoring handles the fine-tuning)
    if (decision === 'protein') {
      return food.category === 'protein' || food.macros.protein >= 15 || food.category === 'mixed';
    }
    if (decision === 'light') {
      return calcCalories(food.macros) <= 500;
    }
    return true;
  });

  // Fallback: if pre-filtering removed too many options, use full catalog
  if (foods.length < 3) foods = foodBlocks;

  // Sort by relevance — priority-aware: most-needed macro drives ranking
  foods = sortByRelevance(foods, remaining, decision);

  // Hard filter: remove foods that do not meaningfully contribute to ANY needed macro.
  // A food passes if it helps at least one macro that still needs filling.
  const hardFiltered = foods.filter((f) => {
    const helpsProtein = remaining.protein > 0 && f.macros.protein >= 3;
    const helpsCarbs   = remaining.carbs   > 0 && f.macros.carbs   >= 5;
    const helpsFats    = remaining.fats    > 0 && f.macros.fats    >= 2;
    return helpsProtein || helpsCarbs || helpsFats;
  });
  // Fallback: keep original list if hard filter is too restrictive
  if (hardFiltered.length >= 3) foods = hardFiltered;

  const candidates = generateCandidates(foods, Math.min(maxItems, 3));
  return selectBest(candidates, ctx);
}

/**
 * Generates a category-aware and decision-aware meal suggestion.
 * Preferred foods for the given meal slot are ranked first.
 *
 * @param remaining  Macros still needed today
 * @param category   Meal slot (breakfast, lunch, etc.)
 * @param decision   Meal type context (light / balanced / protein)
 */
export function generateSuggestedMealForCategory(
  remaining: MealMacro,
  category: MealCategory,
  decision?: DecisionMode,
): SuggestedMeal {
  const preferredNames = PREFERRED_FOODS_BY_CATEGORY[category] ?? [];
  const preferredFoods = FOOD_BLOCKS.filter((f) => preferredNames.includes(f.name));
  const otherFoods     = FOOD_BLOCKS.filter((f) => !preferredNames.includes(f.name));

  // Preferred foods first, others as fallback
  let orderedFoods = [...preferredFoods, ...otherFoods];

  // ──── PRIMARY FILTER: Category tags (strict, no fallback) ────────────────────
  // Only include foods valid for this meal slot — this is deterministic
  const categoryFiltered = orderedFoods.filter((f) =>
    f.mealTags.includes(category)
  );

  // If category filtering eliminates too many foods, log warning but continue
  // (This should rarely happen with well-tagged foods)
  if (categoryFiltered.length === 0) {
    // Return empty suggestion if no foods match the category
    return generateSuggestedMeal(remaining, [], 3, decision);
  }
  orderedFoods = categoryFiltered;

  // ── Decision-based soft filtering ─────────────────────────────────────────
  if (decision === 'light') {
    orderedFoods = orderedFoods.filter((f) =>
      calcCalories(f.macros) <= 450 && f.macros.fats <= 18,
    );
  } else if (decision === 'protein') {
    orderedFoods = orderedFoods.filter((f) =>
      f.category === 'protein' || f.macros.protein >= 18 || f.category === 'mixed',
    );
  }
  // balanced: no pre-filter — scoring handles it

  // ── Legacy category-specific refinements ────────────────────────────────────
  let filteredFoods = orderedFoods;

  if (category === 'breakfast') {
    filteredFoods = orderedFoods.filter((f) => !f.name.toLowerCase().includes('café'));
  } else if (category === 'morning-snack' || category === 'afternoon-snack') {
    filteredFoods = orderedFoods.filter((f) =>
      calcCalories(f.macros) < 400 ||
      f.category === 'carbs'         ||
      f.name.includes('Yogurt')      ||
      f.name.includes('fruta')       ||
      f.name.includes('Fruto'),
    );
  } else if (category === 'dinner') {
    filteredFoods = orderedFoods.filter((f) =>
      f.macros.carbs < 35 || f.category === 'protein' || f.category === 'fats',
    );
  } else if (category === 'night-snack') {
    filteredFoods = orderedFoods.filter((f) =>
      calcCalories(f.macros) < 250 && !f.name.includes('Granola'),
    );
  }
  // lunch: no additional filter — prefer full macros

  // Fallback: if filtering left too few options, use full ordered list
  if (filteredFoods.length < 3) filteredFoods = orderedFoods;

  return generateSuggestedMeal(remaining, filteredFoods, 3, decision);
}

