export type RoutineCard = {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly totalMinutes: number;
  readonly exerciseCount: number;
  readonly setCount: number;
  readonly isModified: boolean;
  readonly metaChips: readonly string[];
};

export type RoutineDay = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly date: Date;
  readonly dateLabel: string;
  readonly summary: string;
  readonly goal: string;
  readonly sessionCount: number;
  readonly exerciseCount: number;
  readonly totalMinutes: number;
  readonly isModified: boolean;
  readonly blocks: readonly RoutineCard[];
};

export type RoutineSummary = {
  dayCount: number;
  totalBlocks: number;
  totalExercises: number;
  totalMinutes: number;
  modifiedDays: number;
};
