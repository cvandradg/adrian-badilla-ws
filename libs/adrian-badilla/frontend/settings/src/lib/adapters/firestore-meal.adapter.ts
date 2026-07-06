import type { FirestoreMeal } from '../types/firestore-diet.types';
import type { RouteSupercenterItem } from '../types/diets.types';
import { MEAL_DISPLAY_NAMES, MEAL_ICONS, MEAL_TYPE_ORDER } from '../constants/diet.constants';

function formatTime(time: string | number): string {
  if (typeof time === 'string') return time;
  if (typeof time === 'number') {
    const h = Math.floor(time / 60).toString().padStart(2, '0');
    const m = (time % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }
  return '00:00';
}

/** 🔢 Obtiene el índice de orden correcto para un tipo de comida */
function getMealTypeOrderIndex(mealType: string): number {
  return MEAL_TYPE_ORDER.indexOf(mealType);
}

export function adaptFirestoreMeal(meal: FirestoreMeal, dayId: string): RouteSupercenterItem {
  const typeLabel = MEAL_DISPLAY_NAMES[meal.type] ?? meal.type;

  return {
    id: meal.id,
    name: typeLabel,
    baseName: typeLabel,
    route: dayId,
    province: '',
    displayFoodName: meal.name || 'Sin nombre',
    foodNameForApi: meal.name || '',
    imgPrimeng: MEAL_ICONS[meal.type] ?? 'pi pi-circle',
    status: meal.status ?? 'pending',
    lastModifiedLabel: formatTime(meal.time),
    macros: {
      protein: meal.protein ?? 0,
      carbs: meal.carbs ?? 0,
      fats: meal.fats ?? 0,
    },
    description: meal.description,
  };
}

/** Groups flat Firestore meals into a map keyed by day, already adapted for the UI.
 *  ⚠️ IMPORTANTE: Ordenar por MEAL_TYPE_ORDER para asegurar que nightSnack sea último
 */
export function groupMealsByDay(
  meals: FirestoreMeal[],
): Record<string, RouteSupercenterItem[]> {
  // 1️⃣ Agrupar por día
  const grouped: Record<string, FirestoreMeal[]> = {};
  for (const meal of meals) {
    (grouped[meal.day] ??= []).push(meal);
  }
  
  // 2️⃣ Ordenar cada día por MEAL_TYPE_ORDER y transformar
  const result: Record<string, RouteSupercenterItem[]> = {};
  for (const dayId in grouped) {
    const dayMeals = grouped[dayId];
    
    // Ordenar por tipo de comida
    dayMeals.sort((a, b) => {
      const indexA = getMealTypeOrderIndex(a.type);
      const indexB = getMealTypeOrderIndex(b.type);
      
      // Si ambos tienen índice conocido, comparar
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      // Si solo uno tiene índice conocido, ponerlo primero
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      // Si ninguno tiene índice conocido, mantener orden actual
      return 0;
    });
    
    // Transformar a UI shape
    result[dayId] = dayMeals.map((meal) => adaptFirestoreMeal(meal, dayId));
  }
  
  return result;
}
