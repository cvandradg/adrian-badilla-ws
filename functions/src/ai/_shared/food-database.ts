// ─── Food Database ────────────────────────────────────────────────────────────
// Static food data used by the AI coach to generate meal suggestions.
// Mirrors the FOOD_BLOCKS in the frontend settings lib — single source of truth
// for macro values. No external dependency required.

export interface FoodItem {
  name: string;
  macros: { protein: number; carbs: number; fats: number };
  category: 'protein' | 'carbs' | 'fats' | 'mixed';
}

export const FOOD_DATABASE: FoodItem[] = [
  // ── Proteínas ─────────────────────────────────────────────────────────────
  { name: 'Pollo (100g)', macros: { protein: 31, carbs: 0, fats: 3.6 }, category: 'protein' },
  { name: 'Pechuga de pollo (100g)', macros: { protein: 31, carbs: 0, fats: 1.2 }, category: 'protein' },
  { name: 'Atún en lata (100g)', macros: { protein: 29, carbs: 0, fats: 0.5 }, category: 'protein' },
  { name: 'Carne magra (100g)', macros: { protein: 26, carbs: 0, fats: 5 }, category: 'protein' },
  { name: 'Salmón (100g)', macros: { protein: 25, carbs: 0, fats: 11 }, category: 'mixed' },
  { name: 'Huevo (1 unit)', macros: { protein: 6, carbs: 0.6, fats: 5 }, category: 'protein' },
  { name: 'Claras (3 units)', macros: { protein: 11, carbs: 1.1, fats: 0.2 }, category: 'protein' },
  { name: 'Pavo (100g)', macros: { protein: 29, carbs: 0, fats: 1.5 }, category: 'protein' },
  { name: 'Yogurt griego (100g)', macros: { protein: 10, carbs: 3.3, fats: 0.5 }, category: 'protein' },
  { name: 'Cottage cheese (100g)', macros: { protein: 11, carbs: 3.4, fats: 4.3 }, category: 'protein' },
  { name: 'Tofu (100g)', macros: { protein: 17, carbs: 1.9, fats: 8.8 }, category: 'protein' },
  { name: 'Whey protein (30g)', macros: { protein: 24, carbs: 1, fats: 1 }, category: 'protein' },

  // ── Carbohidratos ─────────────────────────────────────────────────────────
  { name: 'Arroz integral (100g cocido)', macros: { protein: 2.6, carbs: 23, fats: 0.9 }, category: 'carbs' },
  { name: 'Arroz blanco (100g cocido)', macros: { protein: 2.7, carbs: 28, fats: 0.3 }, category: 'carbs' },
  { name: 'Avena (50g seco)', macros: { protein: 5.35, carbs: 33, fats: 3.45 }, category: 'carbs' },
  { name: 'Papas dulces (100g cocido)', macros: { protein: 1.5, carbs: 20, fats: 0.1 }, category: 'carbs' },
  { name: 'Pan integral (1 rebanada)', macros: { protein: 4, carbs: 12, fats: 1.5 }, category: 'carbs' },
  { name: 'Pasta integral (100g cocida)', macros: { protein: 4, carbs: 26, fats: 0.5 }, category: 'carbs' },
  { name: 'Lentejas (100g cocidas)', macros: { protein: 9, carbs: 20, fats: 0.4 }, category: 'mixed' },
  { name: 'Plátano (1 unit)', macros: { protein: 1.1, carbs: 27, fats: 0.3 }, category: 'carbs' },
  { name: 'Manzana (1 unit)', macros: { protein: 0.3, carbs: 25, fats: 0.2 }, category: 'carbs' },

  // ── Grasas ────────────────────────────────────────────────────────────────
  { name: 'Aguacate (100g)', macros: { protein: 2, carbs: 9, fats: 15 }, category: 'fats' },
  { name: 'Aceite de oliva (1 tbsp)', macros: { protein: 0, carbs: 0, fats: 14 }, category: 'fats' },
  { name: 'Almendras (30g)', macros: { protein: 6, carbs: 6, fats: 14 }, category: 'mixed' },
  { name: 'Mantequilla de maní (2 tbsp)', macros: { protein: 8, carbs: 7, fats: 16 }, category: 'mixed' },
  { name: 'Nueces (30g)', macros: { protein: 4, carbs: 4, fats: 20 }, category: 'fats' },

  // ── Vegetales ─────────────────────────────────────────────────────────────
  { name: 'Brócoli (100g cocido)', macros: { protein: 2.8, carbs: 7, fats: 0.4 }, category: 'carbs' },
  { name: 'Espinaca (100g cocida)', macros: { protein: 2.7, carbs: 3.6, fats: 0.4 }, category: 'carbs' },
  { name: 'Lechuga (100g)', macros: { protein: 1.2, carbs: 2.9, fats: 0.3 }, category: 'carbs' },
  { name: 'Tomate (100g)', macros: { protein: 0.9, carbs: 3.9, fats: 0.2 }, category: 'carbs' },
];

/**
 * Formats the food database as a compact string for inclusion in system prompts.
 * Each line: "FoodName: P{protein}g C{carbs}g F{fats}g"
 */
export function formatFoodDatabaseForPrompt(): string {
  return FOOD_DATABASE.map(
    (f) =>
      `${f.name}: P${f.macros.protein}g C${f.macros.carbs}g F${f.macros.fats}g`
  ).join('\n');
}
