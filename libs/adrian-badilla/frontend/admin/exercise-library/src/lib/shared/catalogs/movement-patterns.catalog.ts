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
  | 'jump';

export const MOVEMENT_PATTERN_CATALOG: CatalogItem<MovementPatternId>[] = [
  { id: 'push', label: 'Empuje' },
  { id: 'pull', label: 'Jalón' },
  { id: 'squat', label: 'Sentadilla' },
  { id: 'hinge', label: 'Bisagra de cadera' },
  { id: 'carry', label: 'Carga' },
  { id: 'rotation', label: 'Rotación' },
  { id: 'lunge', label: 'Zancada' },
  { id: 'plank', label: 'Plancha' },
  { id: 'jump', label: 'Salto' },
];
