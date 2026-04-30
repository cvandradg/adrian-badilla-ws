import type { MealOption } from '../types/diet-decision.types';

export type MealCategory =
  | 'breakfast'
  | 'morningSnack'
  | 'lunch'
  | 'afternoonSnack'
  | 'dinner'
  | 'nightSnack';

export const MEALS_MOCK: Record<MealCategory, MealOption> = {
  breakfast: {
    name: 'Avena (40g) con banana y nueces',
    macros: { protein: 10, carbs: 45, fats: 12 },
    isRecommended: true,
  },
  morningSnack: {
    name: 'Yogurt griego (150g) con granola (30g)',
    macros: { protein: 12, carbs: 28, fats: 8 },
    isRecommended: true,
  },
  lunch: {
    name: 'Pollo a la plancha (150g) con arroz integral y aguacate',
    macros: { protein: 35, carbs: 40, fats: 12 },
    isRecommended: true,
  },
  afternoonSnack: {
    name: 'Banano con mantequilla de maní (15g)',
    macros: { protein: 4, carbs: 30, fats: 8 },
    isRecommended: false,
  },
  dinner: {
    name: 'Salmón al horno (150g) con ensalada verde',
    macros: { protein: 30, carbs: 10, fats: 18 },
    isRecommended: true,
  },
  nightSnack: {
    name: 'Casein shake o yogurt griego (200g)',
    macros: { protein: 20, carbs: 10, fats: 4 },
    isRecommended: false,
  },
};

export const MEAL_PREPARATION: Record<MealCategory, string> = {
  breakfast: 'Cocinar la avena en agua o leche. Agregar la banana en rodajas y las nueces troceadas. Endulzar al gusto con miel o stevia.',
  morningSnack: 'Servir el yogurt griego en un tazón. Añadir la granola por encima justo antes de consumir para mantener la textura crocante.',
  lunch: 'Cocinar el pollo a la plancha con sal y especias. Servir con arroz integral cocido y medio aguacate en rodajas.',
  afternoonSnack: 'Partir el banano en rodajas y untar la mantequilla de maní. Consumir fresco como snack entre comidas.',
  dinner: 'Hornear el salmón a 180°C por 15 min con limón y hierbas. Acompañar con ensalada verde al gusto.',
  nightSnack: 'Preparar el shake de caseína con agua fría o mezclar el yogurt griego con un poco de canela antes de dormir.',
};

