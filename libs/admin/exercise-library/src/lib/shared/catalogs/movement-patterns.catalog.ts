import type { CatalogItem } from './catalog.types';

export type MovementPatternId =
  | 'push'
  | 'pull'
  | 'squat'
  | 'hinge'
  | 'carry'
  | 'rotation'
  | 'lunge'
  | 'plank'
  | 'plyometric'
  | 'cardio';

export const MOVEMENT_PATTERN_CATALOG: CatalogItem<MovementPatternId>[] = [
  { id: 'push', label: 'Empuje' },
  { id: 'pull', label: 'Jalón' },
  { id: 'squat', label: 'Sentadilla' },
  { id: 'hinge', label: 'Bisagra de cadera' },
  { id: 'carry', label: 'Cargada / Carry' },
  { id: 'rotation', label: 'Rotación' },
  { id: 'lunge', label: 'Zancada' },
  { id: 'plank', label: 'Plancha / Isométrico' },
  { id: 'plyometric', label: 'Salto / Pliométrico' },
  { id: 'cardio', label: 'Cardio' },
];
