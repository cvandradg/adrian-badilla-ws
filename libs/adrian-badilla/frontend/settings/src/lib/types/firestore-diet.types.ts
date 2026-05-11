import { Timestamp } from "firebase/firestore";

// ─── Shared Macro Types ──────────────────────────────────────────────────────

/**
 * Daily macro nutrient goals set on a Diet document.
 * Source of truth for macro calculations — never derived or persisted elsewhere.
 */
export interface DailyTarget {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

/**
 * Macros consumed within a single day.
 * Stored in: users/{uid}/daily-status/{date}.consumed
 * Calculated client-side from completed meals — NOT stored in meal documents.
 */
export interface ConsumedMacros {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

// ─── Daily Status ────────────────────────────────────────────────────────────

/**
 * Daily progress document stored at: users/{uid}/daily-status/{date}
 *
 * Architecture notes:
 * - `consumed` is the sum of macros from completedMeals only
 * - `completedMeals` and `rejectedMeals` contain meal IDs (not full objects)
 * - Percentages and derived values are NEVER stored here — computed from signals
 * - This document is written only on user action (meal completion/rejection)
 */
export interface DailyStatus {
  consumed: ConsumedMacros;
  /** IDs of meals the user marked as eaten for this day */
  completedMeals: string[];
  /** IDs of meals the user explicitly skipped */
  rejectedMeals: string[];
}

/** DailyStatus enriched with its Firestore document ID (the ISO date string) */
export interface DailyStatusEntry extends DailyStatus {
  /** ISO date key — matches the Firestore document ID (e.g. '2026-05-11') */
  date: string;
}

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

export interface Diet {
  id: string;

  name: string;

  /**
   * Daily macro goals for this diet plan.
   * Used by withMacroTracker to compute percentages and recommendations.
   */
  dailyTarget: DailyTarget;

  startDate?: Timestamp;
  endDate?: Timestamp;
}