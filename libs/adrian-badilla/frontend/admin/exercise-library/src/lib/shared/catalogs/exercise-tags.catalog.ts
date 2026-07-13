import type { CatalogItem } from './catalog.types';

export type ExerciseTagId =
  | 'rehabilitation'
  | 'warmup'
  | 'mobility'
  | 'explosive'
  | 'plyometric'
  | 'unilateral'
  | 'bilateral'
  | 'free_weight'
  | 'machine'
  | 'time_based'
  | 'distance_based'
  | 'grip_intensive'
  | 'balance';

export const EXERCISE_TAG_CATALOG: CatalogItem<ExerciseTagId>[] = [
  { id: 'rehabilitation', label: 'Rehabilitación' },
  { id: 'warmup', label: 'Warm-up' },
  { id: 'mobility', label: 'Movilidad' },
  { id: 'explosive', label: 'Explosivo' },
  { id: 'plyometric', label: 'Pliométrico' },
  { id: 'unilateral', label: 'Unilateral' },
  { id: 'bilateral', label: 'Bilateral' },
  { id: 'free_weight', label: 'Peso libre' },
  { id: 'machine', label: 'Máquina' },
  { id: 'time_based', label: 'Basado en tiempo' },
  { id: 'distance_based', label: 'Basado en distancia' },
  { id: 'grip_intensive', label: 'Alta demanda de agarre' },
  { id: 'balance', label: 'Balance' },
];
