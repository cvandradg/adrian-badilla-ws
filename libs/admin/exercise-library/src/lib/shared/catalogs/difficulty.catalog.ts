import type { CatalogItem } from './catalog.types';

export type DifficultyId = 'beginner' | 'intermediate' | 'advanced';

export const DIFFICULTY_CATALOG: CatalogItem<DifficultyId>[] = [
  { id: 'beginner', label: 'Principiante' },
  { id: 'intermediate', label: 'Intermedio' },
  { id: 'advanced', label: 'Avanzado' },
];
