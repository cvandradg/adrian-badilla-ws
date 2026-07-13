import type { CatalogItem } from './catalog.types';

export type MuscleId =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'core'
  | 'abs'
  | 'obliques'
  | 'glutes'
  | 'abductors'
  | 'quadriceps'
  | 'hamstrings'
  | 'adductors'
  | 'calves'
  | 'hip_flexors'
  | 'trapezius'
  | 'lats'
  | 'rhomboids'
  | 'lower_back'
  | 'neck';

export const MUSCLE_CATALOG: CatalogItem<MuscleId>[] = [
  { id: 'chest', label: 'Pecho' },
  { id: 'back', label: 'Espalda' },
  { id: 'shoulders', label: 'Hombros' },
  { id: 'biceps', label: 'Bíceps' },
  { id: 'triceps', label: 'Tríceps' },
  { id: 'forearms', label: 'Antebrazos' },
  { id: 'core', label: 'Core' },
  { id: 'abs', label: 'Abdominales' },
  { id: 'obliques', label: 'Oblicuos' },
  { id: 'glutes', label: 'Glúteos' },
  { id: 'abductors', label: 'Abductores' },
  { id: 'quadriceps', label: 'Cuádriceps' },
  { id: 'hamstrings', label: 'Isquiotibiales' },
  { id: 'adductors', label: 'Aductores' },
  { id: 'calves', label: 'Pantorrillas' },
  { id: 'hip_flexors', label: 'Flexores de cadera' },
  { id: 'trapezius', label: 'Trapecio' },
  { id: 'lats', label: 'Dorsales' },
  { id: 'rhomboids', label: 'Romboides' },
  { id: 'lower_back', label: 'Lumbar' },
  { id: 'neck', label: 'Cuello' },
];
