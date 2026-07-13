import type { CatalogItem } from './catalog.types';

export type LevelId = 'low' | 'medium' | 'high';

export const LEVEL_CATALOG: CatalogItem<LevelId>[] = [
  { id: 'low', label: 'Bajo' },
  { id: 'medium', label: 'Medio' },
  { id: 'high', label: 'Alto' },
];
