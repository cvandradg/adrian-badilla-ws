import type { DecisionItem, DietMeal, MealMetadata, MealStatus, RoutineMetadata } from '../types/diet-decision.types';
import { isMealMetadata } from '../types/diet-decision.types';

/**
 * Maps a DietMeal to a generic DecisionItem.
 * Keeps meal macros accessible via metadata for content projection.
 */
export function mapMealToDecisionItem(meal: DietMeal): DecisionItem {
  const metadata: MealMetadata = { macros: meal.macros };
  return {
    id: meal.id,
    title: meal.baseName,
    subtitle: meal.time,
    status: meal.status,
    metadata,
  };
}

// ─── Domain helpers ──────────────────────────────────────────────────────────

/**
 * Enriches a generic status-change event with meal macros when applicable.
 * Returns a plain object — no side effects, no store access.
 */
export function enrichMealStatus(
  item: DecisionItem,
  status: MealStatus
): { id: string; status: MealStatus; macros?: MealMetadata['macros'] } {
  if (status === 'completed' && isMealMetadata(item.metadata)) {
    return { id: item.id, status, macros: item.metadata.macros };
  }
  return { id: item.id, status };
}

// ─── Routine support ──────────────────────────────────────────────────────────

export interface Routine {
  id: string;
  name: string;
  time: string;
  status: DecisionItem['status'];
  exercises: string[];
}

export interface RoutineDay {
  id: string;
  label: string;
  date: string;
  routines: Routine[];
}

/**
 * Maps a Routine to a generic DecisionItem.
 * Exercises are accessible via metadata for content projection.
 */
export function mapRoutineToDecisionItem(routine: Routine): DecisionItem {
  const metadata: RoutineMetadata = { exercises: routine.exercises };
  return {
    id: routine.id,
    title: routine.name,
    subtitle: routine.time,
    status: routine.status,
    metadata,
  };
}
