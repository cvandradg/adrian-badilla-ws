import { DietMeal, MealDecision, MealOption } from "../types/diet-decision.types";

type MealCategory =
  | 'breakfast'
  | 'morning-snack'
  | 'lunch'
  | 'afternoon-snack'
  | 'dinner'
  | 'night-snack';

const mealOption = (
  name: string,
  protein: number,
  carbs: number,
  fats: number,
): MealOption => ({
  name,
  macros: { protein, carbs, fats },
});

export const MEAL_OPTIONS_BY_CATEGORY: Record<MealCategory, Record<MealDecision, MealOption[]>> = {
breakfast: {
  light: [
    mealOption('Yogurt griego natural (150g) con fresas', 15, 12, 4),
    mealOption('Batido verde (espinaca, banana, leche)', 8, 25, 3),
    mealOption('Claras de huevo (4) con espinaca', 14, 2, 0),
  ],
  balanced: [
    mealOption('Avena (40g) con banana y nueces', 10, 45, 12),
    mealOption('2 tostadas integrales con 2 huevos', 18, 30, 14),
    mealOption('Pancakes de avena caseros', 12, 40, 10),
    mealOption('Granola (40g) con yogurt', 12, 35, 10),
  ],
  'high-protein': [
    mealOption('Omelette (3 huevos + pavo)', 28, 2, 18),
    mealOption('Yogurt griego + scoop whey', 30, 10, 4),
    mealOption('Huevos (3) con pechuga de pollo (80g)', 35, 2, 15),
    mealOption('Huevo + tostada + mantequilla', 20, 25, 15),
  ],
},
'morning-snack': {
  light: [
    mealOption('Pepino con hummus (30g)', 3, 10, 5),
    mealOption('Fresas (100g) con yogurt light', 8, 12, 2),
    mealOption('Manzana mediana', 0, 25, 0),
  ],
  balanced: [
    mealOption('Yogurt con granola (30g)', 10, 30, 8),
    mealOption('Banano con mantequilla de mani (15g)', 4, 30, 8),
    mealOption('Sandwich mini de pavo', 12, 20, 5),
    mealOption('Mix frutos secos (20g) + fruta', 5, 20, 10),
  ],
  'high-protein': [
    mealOption('Batido de proteína (1 scoop)', 24, 3, 1),
    mealOption('Rollitos de pavo (80g) con queso', 20, 2, 8),
    mealOption('Queso cottage (150g)', 20, 6, 4),
    mealOption('Barra proteica comercial', 20, 20, 7),
  ],
},
lunch: {
  light: [
    mealOption('Ensalada de atun (100g) con aceite', 25, 5, 10),
    mealOption('Pollo (120g) con vegetales', 30, 10, 6),
    mealOption('Wrap de lechuga con pavo', 20, 8, 5),
  ],
  balanced: [
    mealOption('Pollo (120g) con arroz integral (100g)', 30, 45, 8),
    mealOption('Carne magra (120g) con papa', 28, 35, 10),
    mealOption('Salmon (120g) con quinoa (80g)', 25, 30, 14),
    mealOption('Atun (100g) con camote', 25, 35, 5),
  ],
  'high-protein': [
    mealOption('Pechuga (150g) con broccoli', 40, 10, 5),
    mealOption('Res (150g) con arroz', 35, 30, 12),
    mealOption('Tilapia (150g) con lentejas', 35, 30, 5),
    mealOption('Pollo doble (180g)', 45, 10, 6),
  ],
},
  'afternoon-snack': {
    light: [
      mealOption('Gelatina light con yogurt', 14, 12, 4),
      mealOption('Palitos de apio con dip', 10, 13, 6),
      mealOption('Kiwi con semillas', 8, 16, 7),
    ],
    balanced: [
      mealOption('Tostada integral con aguacate', 13, 26, 12),
      mealOption('Yogurt con fruta y granola', 16, 28, 8),
      mealOption('Queso cottage con galletas de arroz', 18, 24, 7),
      mealOption('Almendras tostadas con fruta', 10, 22, 14),
    ],
    'high-protein': [
      mealOption('Batido de proteina con cacao', 32, 16, 8),
      mealOption('Huevos duros con pavo y queso', 28, 8, 12),
      mealOption('Yogurt griego con whey', 34, 14, 6),
      mealOption('Pollo shredded con pan integral', 30, 20, 10),
    ],
  },
dinner: {
  light: [
    mealOption('Sopa de vegetales con pollo', 20, 15, 5),
    mealOption('Pescado blanco (120g) con ensalada', 25, 5, 5),
    mealOption('Tortilla de claras (4)', 14, 2, 0),
  ],
  balanced: [
    mealOption('Pollo con quinoa', 28, 30, 8),
    mealOption('Tacos integrales de res (2)', 25, 30, 10),
    mealOption('Pasta integral (80g) con atun', 22, 40, 6),
    mealOption('Carne con papa', 28, 35, 10),
  ],
  'high-protein': [
    mealOption('Salmon (120g) con espinaca', 30, 5, 15),
    mealOption('Pollo (150g) con huevo', 40, 2, 10),
    mealOption('Carne magra (150g)', 35, 0, 12),
    mealOption('Filete con broccoli', 35, 5, 10),
  ],
},
  'night-snack': {
    light: [
      mealOption('Leche de almendra con chia', 10, 12, 6),
      mealOption('Infusion con yogurt light', 12, 11, 4),
      mealOption('Gelatina zero con queso cottage', 14, 10, 3),
    ],
    balanced: [
      mealOption('Yogurt con avena', 16, 22, 7),
      mealOption('Fruta con nueces', 10, 30, 10),
      mealOption('Tostada integral con ricotta', 15, 20, 8),
      mealOption('Pan integral con mantequilla y mermelada', 12, 26, 10),
    ],
    'high-protein': [
      mealOption('Caseina con agua', 28, 8, 3),
      mealOption('Yogurt griego con mani', 26, 12, 9),
      mealOption('Queso cottage proteico', 28, 8, 5),
      mealOption('Leche con polvo de proteina', 30, 10, 6),
    ],
  },
};

export const MOCK_MEALS: DietMeal[] = [
  {
    id: '1',
    name: 'Desayuno',
    baseName: 'Desayuno',
    time: '08:00',
    status: 'pending',
    macros: { protein: 24, carbs: 36, fats: 12 }
  },
  {
    id: '2',
    name: 'Snack de la mañana',
    baseName: 'Snack de la mañana',
    time: '10:00',
    status: 'pending',
    macros: { protein: 14, carbs: 24, fats: 9 }
  },
  {
    id: '3',
    name: 'Almuerzo',
    baseName: 'Almuerzo',
    time: '13:00',
    status: 'pending',
    macros: { protein: 32, carbs: 36, fats: 14 }
  },
  {
    id: '4',
    name: 'Snack de la tarde',
    baseName: 'Snack de la tarde',
    time: '16:00',
    status: 'pending',
    macros: { protein: 16, carbs: 24, fats: 10 }
  },
  {
    id: '5',
    name: 'Cena',
    baseName: 'Cena',
    time: '19:00',
    status: 'pending',
    macros: { protein: 30, carbs: 34, fats: 13 }
  },
  {
    id: '6',
    name: 'Snack opcional',
    baseName: 'Snack opcional',
    time: '21:00',
    status: 'pending',
    macros: { protein: 12, carbs: 18, fats: 8 }
  }
];