export type DietStatus = 'completado' | 'en-progreso' | 'cancelado';

export interface DietHistoryEntry {
  id: string;
  dietName: string;
  startDate: string;
  endDate?: string;
  calories: number;
  goal: string;
  status: DietStatus;
  adherencePercent: number;
}

export const DIET_HISTORY_MOCK: DietHistoryEntry[] = [
  {
    id: 'dh-01',
    dietName: 'Volumen Limpio Fase 2',
    startDate: '2026-03-01',
    endDate: '2026-04-30',
    calories: 3200,
    goal: 'Ganar masa muscular',
    status: 'completado',
    adherencePercent: 91,
  },
  {
    id: 'dh-02',
    dietName: 'Definición Moderada',
    startDate: '2026-01-10',
    endDate: '2026-02-28',
    calories: 2400,
    goal: 'Reducción de grasa corporal',
    status: 'completado',
    adherencePercent: 84,
  },
  {
    id: 'dh-03',
    dietName: 'Mantenimiento Activo',
    startDate: '2025-11-01',
    endDate: '2025-12-31',
    calories: 2700,
    goal: 'Mantener peso y composición',
    status: 'completado',
    adherencePercent: 96,
  },
  {
    id: 'dh-04',
    dietName: 'Corte Competitivo',
    startDate: '2025-09-01',
    endDate: '2025-10-20',
    calories: 2000,
    goal: 'Definición máxima pre-competencia',
    status: 'cancelado',
    adherencePercent: 62,
  },
  {
    id: 'dh-05',
    dietName: 'Volumen Máximo',
    startDate: '2025-06-15',
    endDate: '2025-08-31',
    calories: 3600,
    goal: 'Máximo anabolismo',
    status: 'completado',
    adherencePercent: 88,
  },
  {
    id: 'dh-06',
    dietName: 'Volumen Limpio Fase 3',
    startDate: '2026-05-01',
    calories: 3400,
    goal: 'Ganar masa muscular de calidad',
    status: 'en-progreso',
    adherencePercent: 78,
  },
];
