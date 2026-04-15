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
      mealOption('Yogurt griego con fresas', 18, 14, 6),
      mealOption('Batido verde con proteina', 22, 12, 5),
      mealOption('Claras con espinaca', 20, 8, 4),
    ],
    balanced: [
      mealOption('Avena con banano y nueces', 20, 30, 10),
      mealOption('Tostadas integrales con huevo', 24, 28, 11),
      mealOption('Pancakes de avena', 21, 32, 9),
    ],
    'high-protein': [
      mealOption('Omelette de pavo y queso', 32, 10, 14),
      mealOption('Bowl de yogurt con whey', 35, 18, 8),
      mealOption('Huevos revueltos con pollo', 34, 9, 12),
    ],
  },
  'morning-snack': {
    light: [
      mealOption('Pepino con hummus', 8, 12, 5),
      mealOption('Fresas con yogurt light', 10, 14, 4),
      mealOption('Manzana con canela', 4, 18, 3),
    ],
    balanced: [
      mealOption('Yogurt con granola', 15, 24, 8),
      mealOption('Banano con mantequilla de mani', 12, 22, 9),
      mealOption('Sandwich mini de pavo', 16, 20, 7),
    ],
    'high-protein': [
      mealOption('Shake de proteina', 28, 10, 5),
      mealOption('Rollitos de pavo y queso', 24, 6, 8),
      mealOption('Cottage con almendras', 26, 9, 10),
    ],
  },
  lunch: {
    light: [
      mealOption('Ensalada de atun', 24, 16, 9),
      mealOption('Pollo con vegetales salteados', 27, 18, 8),
      mealOption('Wrap de lechuga con pavo', 25, 14, 7),
    ],
    balanced: [
      mealOption('Pollo con arroz integral', 30, 34, 11),
      mealOption('Carne magra con pure', 29, 32, 12),
      mealOption('Salmon con quinoa', 28, 30, 14),
    ],
    'high-protein': [
      mealOption('Pechuga con camote y broccoli', 38, 24, 10),
      mealOption('Bowl de res con arroz', 40, 22, 12),
      mealOption('Tilapia con lentejas', 36, 20, 9),
    ],
  },
  'afternoon-snack': {
    light: [
      mealOption('Gelatina light con yogurt', 12, 10, 3),
      mealOption('Palitos de apio con dip', 9, 11, 4),
      mealOption('Kiwi con semillas', 7, 13, 5),
    ],
    balanced: [
      mealOption('Tostada integral con aguacate', 11, 20, 9),
      mealOption('Yogurt con fruta', 14, 22, 6),
      mealOption('Queso cottage con galletas de arroz', 16, 19, 5),
    ],
    'high-protein': [
      mealOption('Batido de proteina con cacao', 30, 12, 6),
      mealOption('Huevos duros con pavo', 26, 4, 9),
      mealOption('Yogurt griego con whey', 32, 11, 4),
    ],
  },
  dinner: {
    light: [
      mealOption('Crema de vegetales con pollo', 20, 14, 7),
      mealOption('Pescado blanco con ensalada', 24, 12, 8),
      mealOption('Tortilla de claras con hongos', 22, 10, 6),
    ],
    balanced: [
      mealOption('Pollo con quinoa y vegetales', 28, 26, 10),
      mealOption('Tacos integrales de res', 27, 28, 11),
      mealOption('Pasta integral con atun', 25, 30, 9),
    ],
    'high-protein': [
      mealOption('Salmon con espinaca', 34, 12, 15),
      mealOption('Pollo grillado con huevo', 37, 10, 12),
      mealOption('Carne magra con esparragos', 36, 11, 13),
    ],
  },
  'night-snack': {
    light: [
      mealOption('Leche de almendra con chia', 8, 10, 4),
      mealOption('Infusion con yogurt light', 10, 9, 3),
      mealOption('Gelatina zero con queso cottage', 12, 8, 2),
    ],
    balanced: [
      mealOption('Yogurt con avena', 14, 18, 5),
      mealOption('Fruta con nueces', 9, 20, 8),
      mealOption('Tostada integral con ricotta', 13, 16, 6),
    ],
    'high-protein': [
      mealOption('Caseina con agua', 27, 5, 2),
      mealOption('Yogurt griego con mani', 24, 8, 7),
      mealOption('Queso cottage proteico', 26, 6, 4),
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
    macros: { protein: 20, carbs: 30, fats: 10 }
  },
  {
    id: '2',
    name: 'Snack de la manana',
    baseName: 'Snack de la manana',
    time: '10:00',
    status: 'pending',
    macros: { protein: 10, carbs: 20, fats: 5 }
  },
  {
    id: '3',
    name: 'Almuerzo',
    baseName: 'Almuerzo',
    time: '13:00',
    status: 'pending',
    macros: { protein: 30, carbs: 50, fats: 15 }
  },
  {
    id: '4',
    name: 'Snack de la tarde',
    baseName: 'Snack de la tarde',
    time: '16:00',
    status: 'pending',
    macros: { protein: 12, carbs: 18, fats: 6 }
  },
  {
    id: '5',
    name: 'Cena',
    baseName: 'Cena',
    time: '19:00',
    status: 'pending',
    macros: { protein: 28, carbs: 35, fats: 12 }
  },
  {
    id: '6',
    name: 'Snack opcional',
    baseName: 'Snack opcional',
    time: '21:00',
    status: 'pending',
    macros: { protein: 8, carbs: 12, fats: 4 }
  }
];