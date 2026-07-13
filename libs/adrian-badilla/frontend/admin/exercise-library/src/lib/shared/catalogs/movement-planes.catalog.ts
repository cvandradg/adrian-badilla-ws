import type { CatalogItem } from './catalog.types';

export type MovementPlaneId =
  | 'sagittal'
  | 'frontal'
  | 'transverse'
  | 'multiplanar';

export const MOVEMENT_PLANE_CATALOG: CatalogItem<MovementPlaneId>[] = [
  { id: 'sagittal', label: 'Sagital' },
  { id: 'frontal', label: 'Frontal' },
  { id: 'transverse', label: 'Transversal' },
  { id: 'multiplanar', label: 'Multiplanar' },
];
