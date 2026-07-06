import type { CatalogItem } from './catalog.types';

/**
 * exerciseCategory — HOW the exercise is structured mechanically.
 * (Was incorrectly called "exerciseType" before.)
 */
export type ExerciseCategoryId =
  | 'compound'
  | 'isolation'
  | 'functional'
  | 'olympic';

export const EXERCISE_CATEGORY_CATALOG: CatalogItem<ExerciseCategoryId>[] = [
  { id: 'compound', label: 'Compuesto' },
  { id: 'isolation', label: 'Aislamiento' },
  { id: 'functional', label: 'Funcional' },
  { id: 'olympic', label: 'Olímpico' },
];
