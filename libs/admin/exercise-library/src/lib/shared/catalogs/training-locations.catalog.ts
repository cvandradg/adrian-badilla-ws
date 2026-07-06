import type { CatalogItem } from './catalog.types';

export type TrainingLocationId = 'home' | 'gym';

export const TRAINING_LOCATION_CATALOG: CatalogItem<TrainingLocationId>[] = [
  { id: 'home', label: 'Casa' },
  { id: 'gym', label: 'Gimnasio' },
];
