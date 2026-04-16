import { MealOption, MealMacro } from '../types/diet-decision.types';

/**
 * 🥗 FOOD BLOCKS
 * Bloques de alimentos clasificados por tipo y macronutrientes
 */
export interface FoodBlock extends MealOption {
  category?: 'protein' | 'carbs' | 'fats' | 'mixed';
  servingSize?: string; // e.g., "100g", "1 egg", "1 tbsp"
}

export const FOOD_BLOCKS: FoodBlock[] = [
  // 🍗 PROTEÍNAS PRINCIPALES
  { name: 'Pollo (100g)', macros: { protein: 31, carbs: 0, fats: 3.6 }, category: 'protein', servingSize: '100g' },
  { name: 'Pechuga de pollo (100g)', macros: { protein: 31, carbs: 0, fats: 1.2 }, category: 'protein', servingSize: '100g' },
  { name: 'Atún en lata (100g)', macros: { protein: 29, carbs: 0, fats: 0.5 }, category: 'protein', servingSize: '100g' },
  { name: 'Carne magra (100g)', macros: { protein: 26, carbs: 0, fats: 5 }, category: 'protein', servingSize: '100g' },
  { name: 'Salmón (100g)', macros: { protein: 25, carbs: 0, fats: 11 }, category: 'mixed', servingSize: '100g' },
  { name: 'Huevo (1 unit)', macros: { protein: 6, carbs: 0.6, fats: 5 }, category: 'protein', servingSize: '1 unit' },
  { name: 'Claras (3 units)', macros: { protein: 11, carbs: 1.1, fats: 0.2 }, category: 'protein', servingSize: '3 units' },
  { name: 'Pavo (100g)', macros: { protein: 29, carbs: 0, fats: 1.5 }, category: 'protein', servingSize: '100g' },
  { name: 'Yogurt griego (100g)', macros: { protein: 10, carbs: 3.3, fats: 0.5 }, category: 'protein', servingSize: '100g' },
  { name: 'Cottage cheese (100g)', macros: { protein: 11, carbs: 3.4, fats: 4.3 }, category: 'protein', servingSize: '100g' },
  { name: 'Tofu (100g)', macros: { protein: 17, carbs: 1.9, fats: 8.8 }, category: 'protein', servingSize: '100g' },
  { name: 'Whey protein (30g)', macros: { protein: 24, carbs: 1, fats: 1 }, category: 'protein', servingSize: '30g' },

  // 🍚 CARBOHIDRATOS PRINCIPALES
  { name: 'Arroz integral (100g cocido)', macros: { protein: 2.6, carbs: 23, fats: 0.9 }, category: 'carbs', servingSize: '100g' },
  { name: 'Arroz blanco (100g cocido)', macros: { protein: 2.7, carbs: 28, fats: 0.3 }, category: 'carbs', servingSize: '100g' },
  { name: 'Avena (100g seco)', macros: { protein: 10.7, carbs: 66, fats: 6.9 }, category: 'mixed', servingSize: '100g' },
  { name: 'Papas dulces (100g cocido)', macros: { protein: 1.5, carbs: 20, fats: 0.1 }, category: 'carbs', servingSize: '100g' },
  { name: 'Papas blancas (100g cocido)', macros: { protein: 2, carbs: 17, fats: 0.1 }, category: 'carbs', servingSize: '100g' },
  { name: 'Pan integral (1 rebanada)', macros: { protein: 4, carbs: 12, fats: 1.5 }, category: 'carbs', servingSize: '1 slice' },
  { name: 'Pan blanco (1 rebanada)', macros: { protein: 3, carbs: 14, fats: 1 }, category: 'carbs', servingSize: '1 slice' },
  { name: 'Pasta integral (100g cocida)', macros: { protein: 4, carbs: 26, fats: 0.5 }, category: 'carbs', servingSize: '100g' },
  { name: 'Lentejas (100g cocidas)', macros: { protein: 9, carbs: 20, fats: 0.4 }, category: 'mixed', servingSize: '100g' },
  { name: 'Avena (50g seco)', macros: { protein: 5.35, carbs: 33, fats: 3.45 }, category: 'carbs', servingSize: '50g' },
  { name: 'Plátano (1 unit)', macros: { protein: 1.1, carbs: 27, fats: 0.3 }, category: 'carbs', servingSize: '1 unit' },
  { name: 'Manzana (1 unit)', macros: { protein: 0.3, carbs: 25, fats: 0.2 }, category: 'carbs', servingSize: '1 unit' },

  // 🥑 GRASAS
  { name: 'Aguacate (100g)', macros: { protein: 2, carbs: 9, fats: 15 }, category: 'fats', servingSize: '100g' },
  { name: 'Aceite de oliva (1 tbsp)', macros: { protein: 0, carbs: 0, fats: 14 }, category: 'fats', servingSize: '1 tbsp' },
  { name: 'Almendras (30g)', macros: { protein: 6, carbs: 6, fats: 14 }, category: 'mixed', servingSize: '30g' },
  { name: 'Mantequilla de maní (2 tbsp)', macros: { protein: 8, carbs: 7, fats: 16 }, category: 'mixed', servingSize: '2 tbsp' },
  { name: 'Frutos secos mix (30g)', macros: { protein: 5, carbs: 8, fats: 14 }, category: 'mixed', servingSize: '30g' },
  { name: 'Nueces (30g)', macros: { protein: 4, carbs: 4, fats: 20 }, category: 'fats', servingSize: '30g' },
  { name: 'Mantequilla (1 tbsp)', macros: { protein: 0.1, carbs: 0, fats: 11 }, category: 'fats', servingSize: '1 tbsp' },
  { name: 'Coco (30g)', macros: { protein: 3, carbs: 3, fats: 27 }, category: 'fats', servingSize: '30g' },

  // 🥬 VEGETALES (LOW CARB)
  { name: 'Brócoli (100g cocido)', macros: { protein: 2.8, carbs: 7, fats: 0.4 }, category: 'carbs', servingSize: '100g' },
  { name: 'Espinaca (100g cocida)', macros: { protein: 2.7, carbs: 3.6, fats: 0.4 }, category: 'carbs', servingSize: '100g' },
  { name: 'Lechuga (100g)', macros: { protein: 1.2, carbs: 2.9, fats: 0.3 }, category: 'carbs', servingSize: '100g' },
  { name: 'Tomate (100g)', macros: { protein: 0.9, carbs: 3.9, fats: 0.2 }, category: 'carbs', servingSize: '100g' },
  { name: 'Zanahoria (100g cocida)', macros: { protein: 0.9, carbs: 10, fats: 0.2 }, category: 'carbs', servingSize: '100g' },

  // 🍯 CARBOS REFINADOS (Occasional)
  { name: 'Miel (1 tbsp)', macros: { protein: 0.3, carbs: 17, fats: 0 }, category: 'carbs', servingSize: '1 tbsp' },
  { name: 'Granola (50g)', macros: { protein: 12, carbs: 45, fats: 15 }, category: 'mixed', servingSize: '50g' },

  // 🔒 COMIDAS DE SEGURIDAD - Versiones muy pequeñas para últimos macros
  { name: 'Pollo (50g)', macros: { protein: 15.5, carbs: 0, fats: 1.8 }, category: 'protein', servingSize: '50g' },
  { name: 'Pechuga de pollo (50g)', macros: { protein: 15.5, carbs: 0, fats: 0.6 }, category: 'protein', servingSize: '50g' },
  { name: 'Atún en lata (50g)', macros: { protein: 14.5, carbs: 0, fats: 0.25 }, category: 'protein', servingSize: '50g' },
  { name: 'Claras (1-2 units)', macros: { protein: 4, carbs: 0.4, fats: 0.1 }, category: 'protein', servingSize: '1-2 units' },
  { name: 'Huevo (1/2 unit)', macros: { protein: 3, carbs: 0.3, fats: 2.5 }, category: 'protein', servingSize: '1/2 unit' },
  { name: 'Yogurt griego (50g)', macros: { protein: 5, carbs: 1.65, fats: 0.25 }, category: 'protein', servingSize: '50g' },
  { name: 'Cottage cheese (50g)', macros: { protein: 5.5, carbs: 1.7, fats: 2.15 }, category: 'protein', servingSize: '50g' },
  
  // Carbos pequeños de seguridad
  { name: 'Arroz integral (50g cocido)', macros: { protein: 1.3, carbs: 11.5, fats: 0.45 }, category: 'carbs', servingSize: '50g' },
  { name: 'Papas dulces (50g cocido)', macros: { protein: 0.75, carbs: 10, fats: 0.05 }, category: 'carbs', servingSize: '50g' },
  { name: 'Papas blancas (50g cocido)', macros: { protein: 1, carbs: 8.5, fats: 0.05 }, category: 'carbs', servingSize: '50g' },
  { name: 'Pan integral (1/2 rebanada)', macros: { protein: 2, carbs: 6, fats: 0.75 }, category: 'carbs', servingSize: '1/2 slice' },
  { name: 'Manzana (1/2 unit)', macros: { protein: 0.15, carbs: 12.5, fats: 0.1 }, category: 'carbs', servingSize: '1/2 unit' },
  
  // Grasas de seguridad
  { name: 'Almendras (15g)', macros: { protein: 3, carbs: 3, fats: 7 }, category: 'mixed', servingSize: '15g' },
  { name: 'Aceite de oliva (1/2 tbsp)', macros: { protein: 0, carbs: 0, fats: 7 }, category: 'fats', servingSize: '1/2 tbsp' },
  { name: 'Aguacate (50g)', macros: { protein: 1, carbs: 4.5, fats: 7.5 }, category: 'fats', servingSize: '50g' },
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

/**
 * 🧮 FUNCIONES PARA GENERAR SUGERENCIAS
 */

interface SuggestedMeal {
  items: FoodBlock[];
  totals: MealMacro;
  nearestMatch: string; // descriptor de qué tan cerca estuvo
}

/**
 * 🎯 DECISION-AWARE MACRO WEIGHTS
 * Returns weights for protein, carbs, fats based on decision type
 */
function getMacroWeights(decision?: 'light' | 'balanced' | 'protein'): { protein: number; carbs: number; fats: number } {
  if (decision === 'protein') {
    return { protein: 0.7, carbs: 0.2, fats: 0.1 };
  }

  if (decision === 'light') {
    return { protein: 0.35, carbs: 0.35, fats: 0.3 };
  }

  // balanced (default)
  return { protein: 0.4, carbs: 0.35, fats: 0.25 };
}

/**
 * 📊 NORMALIZED SCORING SYSTEM
 * All distances normalized to 0-1 scale for consistent comparison
 */

/**
 * Calcula distancia normalizada de macros (0-1 scale)
 * Penaliza excedencias 3x más que deficiencias
 * Usa pesos dinámicos basados en el tipo de decisión
 */
function getNormalizedMacroDistance(
  meal: SuggestedMeal,
  remaining: MealMacro,
  decision?: 'light' | 'balanced' | 'protein'
): number {
  // Normalizar por lo que queda (evita que valores grandes dominen)
  const proteinError = remaining.protein > 0
    ? (meal.totals.protein - remaining.protein) / remaining.protein
    : meal.totals.protein > 0 ? 1 : 0;

  const carbsError = remaining.carbs > 0
    ? (meal.totals.carbs - remaining.carbs) / remaining.carbs
    : meal.totals.carbs > 0 ? 1 : 0;

  const fatsError = remaining.fats > 0
    ? (meal.totals.fats - remaining.fats) / remaining.fats
    : meal.totals.fats > 0 ? 1 : 0;

  // Función de penalidad: excédente = 3x, deficiencia = 0.5x
  const penaltyFn = (error: number) => {
    if (error >= 0) return error * 3; // Excedencia: penalidad severa
    return Math.abs(error) * 0.5; // Deficiencia: penalidad leve
  };

  const proteinPenalty = penaltyFn(proteinError);
  const carbsPenalty = penaltyFn(carbsError);
  const fatsPenalty = penaltyFn(fatsError);

  // Usar pesos dinámicos basados en decisión
  const weights = getMacroWeights(decision);
  return (proteinPenalty * weights.protein + carbsPenalty * weights.carbs + fatsPenalty * weights.fats);
}

/**
 * ✅ MEAL COHERENCE: Evita combinaciones ilógicas
 * Ejemplo: tuna + honey = no sense
 */
function isMealCoherent(items: FoodBlock[]): boolean {
  const names = items.map((i) => i.name.toLowerCase());

  // Pares de alimentos que NO deben combinarse
  const invalidPairs: [string, string][] = [
    ['atún', 'miel'],
    ['atun', 'miel'],
    ['pollo', 'miel'],
    ['carne', 'miel'],
    ['pavo', 'miel'],
  ];

  for (const [food1, food2] of invalidPairs) {
    const has1 = names.some((n) => n.includes(food1));
    const has2 = names.some((n) => n.includes(food2));
    if (has1 && has2) return false;
  }

  return true;
}

/**
 * 🎯 DECISION-AWARE PENALTY
 * Ajusta scoring según el tipo de decisión
 * ⚡ CRITICAL: Hard penalties for low-protein meals in protein mode
 */
function getDecisionPenalty(
  meal: SuggestedMeal,
  decision?: 'light' | 'balanced' | 'protein'
): number {
  if (!decision || decision === 'balanced') {
    return 0; // Sin penalidad adicional
  }

  const calories = meal.totals.protein * 4 + meal.totals.carbs * 4 + meal.totals.fats * 9;

  if (decision === 'light') {
    // Penalizar calorías altas y grasas
    const caloriePenalty = Math.max(0, (calories - 300) / 300) * 0.3; // Max 0.3
    const fatPenalty = Math.max(0, (meal.totals.fats - 10) / 10) * 0.2; // Max 0.2
    return caloriePenalty + fatPenalty;
  }

  if (decision === 'protein') {
    // ⚡ HARD PENALTIES for low-protein meals (critical fix)
    // If protein is too low, penalty is very high (essentially excludes the meal)
    if (meal.totals.protein < 10) {
      return 5; // Effectively discard (higher than any macro distance score)
    }

    if (meal.totals.protein < 20) {
      return 1.5; // Strong penalty for marginally low protein
    }

    // For protein >= 20g, apply ratio-based penalty for additional refinement
    const proteinRatio = meal.totals.protein > 0
      ? meal.totals.protein / Math.max(calories, 1)
      : 0;

    // Penalize if less than 30% of calories are protein
    if (proteinRatio < 0.3) {
      return (0.3 - proteinRatio) * 0.8; // Slightly stronger penalty than before (max 0.24)
    }
  }

  return 0;
}

/**
 * 🔍 SCORE A CANDIDATE MEAL (Stage 2 refinement)
 * Combina: distancia + coherencia + decisión
 */
function scoreCandidate(
  meal: SuggestedMeal,
  remaining: MealMacro,
  decision?: 'light' | 'balanced' | 'protein'
): number {
  // Use decision-aware macro distance scoring
  const macroScore = getNormalizedMacroDistance(meal, remaining, decision);

  // Penalidad por incoherencia
  const coherencePenalty = isMealCoherent(meal.items) ? 0 : 2; // Score 2 = exclusión

  // Penalidad por decisión (includes hard protein penalties)
  const decisionPenalty = getDecisionPenalty(meal, decision);

  // Slight preference for simpler meals (2 items better than 3)
  const simplicity = meal.items.length <= 2 ? -0.05 : 0;

  return macroScore + coherencePenalty + decisionPenalty + simplicity;
}

/**
 * 🚀 STAGE 1: Generate candidate meals (macro-focused)
 * Returned as list of possibilities, not single best
 */
function generateCandidateMeals(
  sortedFoods: FoodBlock[],
  remaining: MealMacro,
  maxItems: number = 3
): SuggestedMeal[] {
  const candidates: Array<{ meal: SuggestedMeal; score: number }> = [];

  // 1-item meals
  for (let idx = 0; idx < Math.min(sortedFoods.length, 20); idx++) {
    const food = sortedFoods[idx];
    const meal: SuggestedMeal = {
      items: [food],
      totals: food.macros,
      nearestMatch: '',
    };

    const score = getNormalizedMacroDistance(meal, remaining);
    candidates.push({ meal, score });
  }

  // 2-item meals
  if (maxItems >= 2 && sortedFoods.length > 1) {
    for (let i = 0; i < Math.min(sortedFoods.length, 15); i++) {
      for (let j = i + 1; j < Math.min(sortedFoods.length, 20); j++) {
        // Skip duplicates
        if (hasBaseFoodDuplicate([sortedFoods[i]], sortedFoods[j])) {
          continue;
        }

        const meal: SuggestedMeal = {
          items: [sortedFoods[i], sortedFoods[j]],
          totals: {
            protein: sortedFoods[i].macros.protein + sortedFoods[j].macros.protein,
            carbs: sortedFoods[i].macros.carbs + sortedFoods[j].macros.carbs,
            fats: sortedFoods[i].macros.fats + sortedFoods[j].macros.fats,
          },
          nearestMatch: '',
        };

        const score = getNormalizedMacroDistance(meal, remaining);
        candidates.push({ meal, score });
      }
    }
  }

  // 3-item meals
  if (maxItems >= 3 && sortedFoods.length > 2) {
    for (let i = 0; i < Math.min(sortedFoods.length, 10); i++) {
      for (let j = i + 1; j < Math.min(sortedFoods.length, 13); j++) {
        if (hasBaseFoodDuplicate([sortedFoods[i]], sortedFoods[j])) {
          continue;
        }

        for (let k = j + 1; k < Math.min(sortedFoods.length, 15); k++) {
          if (hasBaseFoodDuplicate([sortedFoods[i], sortedFoods[j]], sortedFoods[k])) {
            continue;
          }

          const meal: SuggestedMeal = {
            items: [sortedFoods[i], sortedFoods[j], sortedFoods[k]],
            totals: {
              protein: sortedFoods[i].macros.protein + sortedFoods[j].macros.protein + sortedFoods[k].macros.protein,
              carbs: sortedFoods[i].macros.carbs + sortedFoods[j].macros.carbs + sortedFoods[k].macros.carbs,
              fats: sortedFoods[i].macros.fats + sortedFoods[j].macros.fats + sortedFoods[k].macros.fats,
            },
            nearestMatch: '',
          };

          const score = getNormalizedMacroDistance(meal, remaining);
          candidates.push({ meal, score });
        }
      }
    }
  }

  // Return top candidates (before reranking)
  return candidates
    .sort((a, b) => a.score - b.score)
    .slice(0, 20)
    .map((c) => c.meal);
}

/**
 * 🏆 STAGE 2: Re-rank and select best candidate
 */
function selectBestMeal(
  candidates: SuggestedMeal[],
  remaining: MealMacro,
  decision?: 'light' | 'balanced' | 'protein'
): SuggestedMeal {
  if (candidates.length === 0) {
    return {
      items: [],
      totals: { protein: 0, carbs: 0, fats: 0 },
      nearestMatch: 'Sin opciones seguras',
    };
  }

  // Score each candidate with full criteria
  const scored = candidates.map((meal) => ({
    meal,
    score: scoreCandidate(meal, remaining, decision),
  }));

  // Sort by score (lower = better)
  scored.sort((a, b) => a.score - b.score);

  const bestMeal = scored[0].meal;
  const bestScore = scored[0].score;

  // Generate description
  if (bestScore >= 2) {
    bestMeal.nearestMatch = 'Sin opciones seguras';
  } else if (bestScore < 0.15) {
    bestMeal.nearestMatch = '✅ Coincidencia perfecta';
  } else if (bestScore < 0.35) {
    bestMeal.nearestMatch = '🎯 Muy cercana';
  } else if (bestScore < 0.6) {
    bestMeal.nearestMatch = '👍 Buena aproximación';
  } else {
    bestMeal.nearestMatch = '📊 Aproximación';
  }

  return bestMeal;
}

/**
 * OLD FUNCTIONS RETAINED FOR COMPATIBILITY
 * (These are used earlier in the file)
 */

/**
 * Obtiene el macro que más falta (prioridad)
 */
function getLowestMacro(remaining: MealMacro): 'protein' | 'carbs' | 'fats' {
  const percentages = {
    protein: remaining.protein > 0 ? 50 / remaining.protein : 0,
    carbs: remaining.carbs > 0 ? 50 / remaining.carbs : 0,
    fats: remaining.fats > 0 ? 50 / remaining.fats : 0,
  };
  
  if (percentages.protein >= percentages.carbs && percentages.protein >= percentages.fats) {
    return 'protein';
  } else if (percentages.carbs >= percentages.fats) {
    return 'carbs';
  } else {
    return 'fats';
  }
}

/**
 * Calcula relevancia de un alimento basado en cuánto se acerca a los macros faltantes
 * Considera todos los macros, no solo uno
 * Penaliza alimentos "demasiado versátiles" para forzar variedad
 */
function calculateFoodRelevance(food: FoodBlock, remaining: MealMacro): number {
  // Calcular qué porcentaje de cada macro faltante cubre este alimento
  const proteinCoverage = remaining.protein > 0 ? food.macros.protein / remaining.protein : 0;
  const carbsCoverage = remaining.carbs > 0 ? food.macros.carbs / remaining.carbs : 0;
  const fatsCoverage = remaining.fats > 0 ? food.macros.fats / remaining.fats : 0;

  // El mejor alimento es el que cubre de forma BALANCEADA sin exceder mucho
  // Penalizar si cubre muy poco (<5%) o muy mucho (>150%)
  const getScoreForCoverage = (coverage: number) => {
    if (coverage === 0) return 0; // No aporta este macro
    if (coverage < 0.05) return 0.1; // Muy poco
    if (coverage > 1.5) return 0; // Excede demasiado
    if (coverage > 1) return coverage * 0.5; // Levemente sobre pero penalizado
    return coverage; // Ideal
  };

  const proteinScore = getScoreForCoverage(proteinCoverage);
  const carbsScore = getScoreForCoverage(carbsCoverage);
  const fatsScore = getScoreForCoverage(fatsCoverage);

  // Retornar promedio ponderado (mayor puntuación = mejor match)
  let score = (proteinScore + carbsScore + fatsScore) / 3;

  // 🎯 PENALIDAD AGRESIVA POR VERSATILIDAD: Alimentos "demasiado adaptables" reciben penalidad severa
  // Esto reduce DRÁSTICAMENTE la chance de alimentos como avena/granola
  const isVersatileFood = food.category === 'mixed';
  if (isVersatileFood) {
    // Penalidad severa: reducir a 30% de su puntuación original
    // Esto hace que sean candidatos muy débiles comparado con opciones especializadas
    score *= 0.3;
  }

  return score;
}

/**
 * 🔍 Extrae el nombre base de un alimento (sin la información de cantidad)
 * "Avena (100g seco)" → "avena"
 * "Pollo (50g)" → "pollo"
 */
function getBaseFoodName(foodName: string): string {
  return foodName.split('(')[0].trim().toLowerCase();
}

/**
 * Verifica si un alimento está duplicado en una comida
 * Detecta "Avena (100g)" + "Avena (50g)" como duplicados
 */
function hasBaseFoodDuplicate(foods: FoodBlock[], newFood: FoodBlock): boolean {
  const newFoodBase = getBaseFoodName(newFood.name);
  return foods.some((f) => getBaseFoodName(f.name) === newFoodBase);
}

/**
 * Filtra alimentos que NO contengan macros ya completados
 * Si un macro está al 100%, excluye alimentos "altos" en ese macro
 */
function filterOutCompletedMacros(foods: FoodBlock[], targetMacros: MealMacro): FoodBlock[] {
  return foods.filter((food) => {
    // Si proteína está completa (≤ 0), rechazar alimentos altos en proteína (>5g)
    if (targetMacros.protein === 0 && food.macros.protein > 5) {
      return false;
    }
    
    // Si carbohidratos están completos (≤ 0), rechazar alimentos altos en carbs (>5g)
    if (targetMacros.carbs === 0 && food.macros.carbs > 5) {
      return false;
    }
    
    // Si grasas están completas (≤ 0), rechazar alimentos altos en grasas (>3g)
    if (targetMacros.fats === 0 && food.macros.fats > 3) {
      return false;
    }
    
    return true;
  });
}

/**
 * Ordena food blocks por relevancia basado en cuánto se acercan a los macros faltantes
 * Ahora considera TODOS los macros de forma balanceada, no solo uno
 */
function sortFoodsByRelevance(foods: FoodBlock[], remaining: MealMacro): FoodBlock[] {
  // Calcular relevancia para cada alimento
  const foodsWithScore = foods.map((food) => ({
    food,
    relevance: calculateFoodRelevance(food, remaining),
    // Agregar pequeño factor aleatorio para variar resultados
    randomBoost: Math.random() * 0.15,
  }));

  // Ordenar por relevancia + random boost (mayor score = mejor)
  foodsWithScore.sort(
    (a, b) => (b.relevance + b.randomBoost) - (a.relevance + a.randomBoost)
  );
  return foodsWithScore.map((item) => item.food);
}

/**
 * 🎯 FUNCIÓN PRINCIPAL: Genera una comida sugerida basada en macros faltantes
 * @param remaining Macros faltantes en el día
 * @param foodBlocks Lista de bloques de alimento disponibles
 * @param maxItems Máximo de items en la sugerencia (default: 4)
 * @param decision Tipo de decisión para ajustar algoritmo (light/balanced/protein)
 * @returns Comida sugerida con items y totales
 */
export function generateSuggestedMeal(
  remaining: MealMacro,
  foodBlocks: FoodBlock[] = FOOD_BLOCKS,
  maxItems: number = 4,
  decision?: 'light' | 'balanced' | 'protein'
): SuggestedMeal {
  // 🛑 VALIDACIÓN: Si todos los macros están al 100% o excedidos, retornar vacío
  if (remaining.protein <= 0 && remaining.carbs <= 0 && remaining.fats <= 0) {
    return {
      items: [],
      totals: { protein: 0, carbs: 0, fats: 0 },
      nearestMatch: '✅ Macros completados',
    };
  }

  // 🎯 IMPORTANTE: Excluir macros que ya están completos (≤ 0)
  // Solo buscar alimentos que contribuyan a los macros que aún faltan
  const targetMacros: MealMacro = {
    protein: Math.max(0, remaining.protein),
    carbs: Math.max(0, remaining.carbs),
    fats: Math.max(0, remaining.fats),
  };

  // Si después de ajustar no queda nada, no hay sugerencia
  if (targetMacros.protein === 0 && targetMacros.carbs === 0 && targetMacros.fats === 0) {
    return {
      items: [],
      totals: { protein: 0, carbs: 0, fats: 0 },
      nearestMatch: '✅ Macros completados',
    };
  }

  // Calcular calorías restantes basado en MACROS ACTIVOS
  const remainingCals = targetMacros.protein * 4 + targetMacros.carbs * 4 + targetMacros.fats * 9;
  
  // Si quedan pocos macro, usar solo alimentos de seguridad muy pequeños
  let foodsToUse = foodBlocks;
  if (remainingCals < 300) {
    // Usar solo alimentos "seguros" para últimos macros (110% máximo)
    foodsToUse = foodBlocks.filter((f) => {
      const foodCals = f.macros.protein * 4 + f.macros.carbs * 4 + f.macros.fats * 9;
      return foodCals <= remainingCals * 1.1;
    });
    
    // Si no hay opciones de seguridad, usar el bloque original
    if (foodsToUse.length === 0) {
      foodsToUse = foodBlocks;
    }
  }

  // Filtrar alimentos que no excedan más de 120% del macro restante (más conservador)
  // Y que NO AGREGUEN macros que ya están completos
  // 🚫 EXCLUIR: Avena (100g) y Granola - demasiado OP, fomentar variedad
  let availableFoods = foodsToUse.filter((food) => {
    // Bloquear específicamente alimentos que dominan demasiado
    const isBlockedFood = food.name === 'Avena (100g seco)' || food.name === 'Granola (50g)';
    if (isBlockedFood) {
      return false; // Excluir completamente
    }

    // Si un macro está completado (targetMacros = 0), rechazar alimentos que lo contengan
    const proteinOk = targetMacros.protein === 0 ? food.macros.protein === 0 : food.macros.protein <= targetMacros.protein * 1.2;
    const carbsOk = targetMacros.carbs === 0 ? food.macros.carbs === 0 : food.macros.carbs <= targetMacros.carbs * 1.2;
    const fatsOk = targetMacros.fats === 0 ? food.macros.fats === 0 : food.macros.fats <= targetMacros.fats * 1.2;

    return proteinOk && carbsOk && fatsOk;
  });

  // Aplicar filtrado adicional para excluir alimentos "altos" en macros completados
  // (más flexible: permite 0-5g en lugar de exactamente 0)
  availableFoods = filterOutCompletedMacros(availableFoods, targetMacros);

  // Si no hay opciones disponibles, retornar vacío
  if (availableFoods.length === 0) {
    return {
      items: [],
      totals: { protein: 0, carbs: 0, fats: 0 },
      nearestMatch: 'Sin opciones seguras',
    };
  }

  // Ordenar por relevancia basado en macros ACTIVOS (completados = 0)
  const sortedFoods = sortFoodsByRelevance(availableFoods, targetMacros);

  // Generar combinaciones iterativamente
  let bestMeal: SuggestedMeal = {
    items: [],
    totals: { protein: 0, carbs: 0, fats: 0 },
    nearestMatch: 'No suggestions',
  };
  let bestDistance = Infinity;

  // Generar meal de un solo item
  for (const food of sortedFoods) {
    const testMeal: SuggestedMeal = {
      items: [food],
      totals: food.macros,
      nearestMatch: '',
    };

    const distance = getNormalizedMacroDistance(testMeal, targetMacros, decision);
    
    // Minimal penalty for simplicity - prefer compound meals over single items
    const simplicity = testMeal.items.length <= 1 ? 0.1 : 0;
    // ✅ DRASTICALLY REDUCED RANDOMNESS (0.2-0.5 instead of 12-40)
    // Keeps scoring deterministic and macro-focused
    const randomFactor = Math.random() * 0.3;
    const score = distance + simplicity + randomFactor;

    if (score < bestDistance) {
      bestDistance = score;
      bestMeal = testMeal;
    }
  }

  // Generar meals de 2 items (explorar MUCHO más combinaciones)
  if (maxItems >= 2 && sortedFoods.length > 1) {
    for (let i = 0; i < Math.min(sortedFoods.length, 25); i++) {
      for (let j = i + 1; j < Math.min(sortedFoods.length, 30); j++) {
        // 🚫 PREVENIR DUPLICADOS: No combinar "Avena (100g)" con "Avena (50g)"
        if (hasBaseFoodDuplicate([sortedFoods[i]], sortedFoods[j])) {
          continue;
        }

        const testMeal: SuggestedMeal = {
          items: [sortedFoods[i], sortedFoods[j]],
          totals: {
            protein: sortedFoods[i].macros.protein + sortedFoods[j].macros.protein,
            carbs: sortedFoods[i].macros.carbs + sortedFoods[j].macros.carbs,
            fats: sortedFoods[i].macros.fats + sortedFoods[j].macros.fats,
          },
          nearestMatch: '',
        };

        const distance = getNormalizedMacroDistance(testMeal, targetMacros, decision);
        const simplicity = testMeal.items.length <= 2 ? -0.05 : 0;
        const randomFactor = Math.random() * 0.3;
        const score = distance + simplicity + randomFactor;

        if (score < bestDistance) {
          bestDistance = score;
          bestMeal = testMeal;
        }
      }
    }
  }

  // Generar meals de 3 items (explorar aún más)
  if (maxItems >= 3 && sortedFoods.length > 2) {
    for (let i = 0; i < Math.min(sortedFoods.length, 12); i++) {
      for (let j = i + 1; j < Math.min(sortedFoods.length, 15); j++) {
        // 🚫 PREVENIR DUPLICADOS: No mezclar alimentos base iguales
        if (hasBaseFoodDuplicate([sortedFoods[i]], sortedFoods[j])) {
          continue;
        }

        for (let k = j + 1; k < Math.min(sortedFoods.length, 18); k++) {
          // 🚫 PREVENIR DUPLICADOS: Verificar que k no sea duplicado de i ni j
          if (
            hasBaseFoodDuplicate([sortedFoods[i], sortedFoods[j]], sortedFoods[k])
          ) {
            continue;
          }

          const testMeal: SuggestedMeal = {
            items: [sortedFoods[i], sortedFoods[j], sortedFoods[k]],
            totals: {
              protein:
                sortedFoods[i].macros.protein +
                sortedFoods[j].macros.protein +
                sortedFoods[k].macros.protein,
              carbs:
                sortedFoods[i].macros.carbs +
                sortedFoods[j].macros.carbs +
                sortedFoods[k].macros.carbs,
              fats:
                sortedFoods[i].macros.fats +
                sortedFoods[j].macros.fats +
                sortedFoods[k].macros.fats,
            },
            nearestMatch: '',
          };

          const distance = getNormalizedMacroDistance(testMeal, targetMacros, decision);
          const simplicity = testMeal.items.length <= 2 ? -0.05 : 0;
          const randomFactor = Math.random() * 0.3;
          const score = distance + simplicity + randomFactor;

          if (score < bestDistance) {
            bestDistance = score;
            bestMeal = testMeal;
          }
        }
      }
    }
  }

  // Generar matching description
  if (bestMeal.items.length === 0) {
    bestMeal.nearestMatch = 'Sin opciones seguras';
  } else if (bestDistance < 15) {
    bestMeal.nearestMatch = '✅ Coincidencia perfecta';
  } else if (bestDistance < 30) {
    bestMeal.nearestMatch = '🎯 Muy cercana';
  } else if (bestDistance < 50) {
    bestMeal.nearestMatch = '👍 Buena aproximación';
  } else {
    bestMeal.nearestMatch = '📊 Aproximación';
  }

  return bestMeal;
}

/**
 * Genera sugerencias filtradas por categoría de comida Y tipo de decisión
 * @param remaining Macros restantes
 * @param category Categoría de comida (breakfast, lunch, etc)
 * @param decision Tipo de decisión: 'light' (ligero), 'balanced' (balanceado), 'protein' (proteico)
 */
export function generateSuggestedMealForCategory(
  remaining: MealMacro,
  category: 'breakfast' | 'morning-snack' | 'lunch' | 'afternoon-snack' | 'dinner' | 'night-snack',
  decision?: 'light' | 'balanced' | 'protein'
): SuggestedMeal {
  // Obtener alimentos preferidos para esta categoría
  const preferredNames = PREFERRED_FOODS_BY_CATEGORY[category] || [];
  
  // Separar alimentos preferidos de otros
  const preferredFoods = FOOD_BLOCKS.filter((f) => preferredNames.includes(f.name));
  const otherFoods = FOOD_BLOCKS.filter((f) => !preferredNames.includes(f.name));
  
  // Priorizar preferidos pero incluir otros como fallback
  let orderedFoods = [...preferredFoods, ...otherFoods];

  // 🎯 FILTROS POR TIPO DE DECISIÓN
  if (decision === 'light') {
    // 🟢 LIGERO: Menos calorías, menos grasas, proteína moderada
    orderedFoods = orderedFoods.filter((f) => {
      const calories = f.macros.protein * 4 + f.macros.carbs * 4 + f.macros.fats * 9;
      // Excluir: alimentos muy altos en grasas o muy altos en calorías
      return calories <= 400 && f.macros.fats <= 15; // Items ligeros
    });
  } else if (decision === 'protein') {
    // 🔴 PROTEICO: SOLO alimentos específicamente proteicos (NO 'mixed' ambiguo)
    // Favorecer: categoría protein pura, mínimo 15g de proteína
    orderedFoods = orderedFoods.filter((f) => {
      // Ser ESTRICTO: solo category === 'protein' O proteína >= 20g
      return f.category === 'protein' || f.macros.protein >= 20;
    });
  }
  // 🟡 BALANCED: No aplicar filtros especiales, usar todos

  // Aplicar filtrado adicional según categoría
  let filteredFoods = orderedFoods;

  if (category === 'breakfast') {
    // Favorecer combinaciones balanceadas
    filteredFoods = orderedFoods.filter(
      (f) => !f.name.toLowerCase().includes('café') // Excluir bebidas pesadas
    );
  } else if (category === 'morning-snack' || category === 'afternoon-snack') {
    // Snacks más ligeros y rápidos
    filteredFoods = orderedFoods.filter(
      (f) =>
        f.macros.protein + f.macros.carbs + f.macros.fats < 300 || // Items pequeños
        f.category === 'carbs' ||
        f.name.includes('Yogurt') ||
        f.name.includes('fruta') ||
        f.name.includes('Fruto')
    );
  } else if (category === 'lunch') {
    // Comida principal: favorecer completas
    // No filtrar, usamos todos
  } else if (category === 'dinner') {
    // Cena más ligera: menos carbs
    filteredFoods = orderedFoods.filter(
      (f) => f.macros.carbs < 30 || f.category === 'protein' || f.category === 'fats'
    );
  } else if (category === 'night-snack') {
    // Snack nocturno muy ligero
    filteredFoods = orderedFoods.filter(
      (f) =>
        f.macros.protein + f.macros.carbs + f.macros.fats < 200 && !f.name.includes('Granola')
    );
  }

  return generateSuggestedMeal(remaining, filteredFoods, 3, decision);
}
