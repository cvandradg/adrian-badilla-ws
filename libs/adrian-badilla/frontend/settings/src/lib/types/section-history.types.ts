export type HistoryEntryStatus = 'completado' | 'en-progreso' | 'cancelado';

/**
 * Generic history entry that works for both diet history and routine history.
 * Fields map to what is displayed in the timeline cards.
 */
export interface HistoryEntry {
  id: string;
  /** Card title: diet name or routine name */
  name: string;
  startDate: string;
  endDate?: string;
  status: HistoryEntryStatus;
  /** 0‒100 percentage shown in the adherence badge */
  adherencePercent: number;
  /** Main metric text, e.g. "3 200 kcal / día" or "5 ejercicios / sesión" */
  primaryMetric: string;
  /** PrimeIcons class suffix for the metric icon, e.g. "bolt" or "stopwatch" */
  primaryMetricIcon: string;
  goal: string;
}

export type HistoryType = 'diet' | 'routine';
