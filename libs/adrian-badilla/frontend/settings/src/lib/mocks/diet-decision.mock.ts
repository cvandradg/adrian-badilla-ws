import { DietMeal } from "../types/diet-decision.types";

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
    name: 'Snack',
    baseName: 'Snack',
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
  }
];