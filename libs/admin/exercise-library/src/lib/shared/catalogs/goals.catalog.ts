import type { CatalogItem } from './catalog.types';

export type GoalId =
  | 'muscle_gain'
  | 'fat_loss'
  | 'strength'
  | 'endurance'
  | 'flexibility'
  | 'rehabilitation'
  | 'general_fitness'
  | 'athletic_performance'
  | 'posture';

export const GOAL_CATALOG: CatalogItem<GoalId>[] = [
  { id: 'muscle_gain', label: 'Ganar masa muscular' },
  { id: 'fat_loss', label: 'Pérdida de grasa' },
  { id: 'strength', label: 'Ganar fuerza' },
  { id: 'endurance', label: 'Mejorar resistencia' },
  { id: 'flexibility', label: 'Mejorar flexibilidad' },
  { id: 'rehabilitation', label: 'Rehabilitación' },
  { id: 'general_fitness', label: 'Condición física general' },
  { id: 'athletic_performance', label: 'Rendimiento deportivo' },
  { id: 'posture', label: 'Mejorar postura' },
];
