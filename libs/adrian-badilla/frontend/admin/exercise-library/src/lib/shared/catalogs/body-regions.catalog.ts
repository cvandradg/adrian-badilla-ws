import type { CatalogItem } from './catalog.types';

export type BodyRegionId =
  | 'upper_body'
  | 'lower_body'
  | 'full_body'
  | 'core'
  | 'cardio';

export const BODY_REGION_CATALOG: CatalogItem<BodyRegionId>[] = [
  { id: 'upper_body', label: 'Tren superior' },
  { id: 'lower_body', label: 'Tren inferior' },
  { id: 'full_body', label: 'Cuerpo completo' },
  { id: 'core', label: 'Core' },
  { id: 'cardio', label: 'Cardio' },
];
