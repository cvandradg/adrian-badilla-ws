/** Canonical meal type keys */
export type MealType =
  | 'breakfast'
  | 'morningSnack'
  | 'lunch'
  | 'afternoonSnack'
  | 'dinner'
  | 'nightSnack';

/**
 * Raw shape stored in the flat Firestore 'meals' collection.
 * Each document belongs to a diet (dietsId) and a day (day).
 */
export interface FirestoreMealDoc {
  /** Reference to the parent diet */
  dietsId: string;
  /** Day key (e.g. 'lunes', 'martes') */
  day: string;
  /** Sort order within the week */
  dayOrder: number;
  /** Sort order within the day */
  order: number;
  /** Meal category key */
  type: string;
  /** Real food name from Firestore (e.g. "Sopa Maruchan") */
  name: string;
  /** Time as string (e.g. "8:00") or minutes since midnight */
  time: string | number;
  /** Macro nutrients */
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
  /** Status override stored in Firestore (optional) */
  status?: 'pending' | 'completed' | 'skipped';
  /** Optional reference to a food catalog entry */
  foodId?: string;
  /** Descripción de preparación o notas (optional) */
  description?: string;
}

/** FirestoreMealDoc enriched with its Firestore document ID */
export interface FirestoreMeal extends FirestoreMealDoc {
  id: string;
}

/** One day's entry after loading from Firestore */
export interface DietDay {
  dayId: string;
  meals: FirestoreMeal[];
}
