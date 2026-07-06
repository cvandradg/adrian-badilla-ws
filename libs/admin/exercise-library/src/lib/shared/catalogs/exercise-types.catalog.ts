import type { CatalogItem } from './catalog.types';

/**
 * exerciseType — WHAT training goal the exercise targets.
 * (Was incorrectly called "exerciseCategory" before.)
 */
export type ExerciseTypeId =
  | 'strength'
  | 'hypertrophy'
  | 'endurance'
  | 'power'
  | 'mobility'
  | 'flexibility'
  | 'balance'
  | 'cardio'
  | 'hiit'
  | 'rehabilitation';

export const EXERCISE_TYPE_CATALOG: CatalogItem<ExerciseTypeId>[] = [
  { id: 'strength', label: 'Fuerza' },
  { id: 'hypertrophy', label: 'Hipertrofia' },
  { id: 'endurance', label: 'Resistencia' },
  { id: 'power', label: 'Potencia' },
  { id: 'mobility', label: 'Movilidad' },
  { id: 'flexibility', label: 'Flexibilidad' },
  { id: 'balance', label: 'Equilibrio' },
  { id: 'cardio', label: 'Cardio' },
  { id: 'hiit', label: 'HIIT' },
  { id: 'rehabilitation', label: 'Rehabilitación' },
];
