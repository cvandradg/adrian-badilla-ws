import type { Timestamp } from '@angular/fire/firestore';

// ─── Canonical ID types (kept local to avoid cross-library deps) ──────────────

export type RoutineDifficultyId = 'beginner' | 'intermediate' | 'advanced';
export type RoutineGoalId =
  | 'muscle_gain'
  | 'fat_loss'
  | 'strength'
  | 'endurance'
  | 'flexibility'
  | 'rehabilitation'
  | 'general_fitness'
  | 'athletic_performance'
  | 'posture';
export type RoutineLocationId = 'home' | 'gym';

// ─── Catalog items ────────────────────────────────────────────────────────────

export interface RoutineCatalogItem<T extends string = string> {
  id: T;
  label: string;
}

export const ROUTINE_DIFFICULTY_CATALOG: RoutineCatalogItem<RoutineDifficultyId>[] = [
  { id: 'beginner', label: 'Principiante' },
  { id: 'intermediate', label: 'Intermedio' },
  { id: 'advanced', label: 'Avanzado' },
];

export const ROUTINE_GOAL_CATALOG: RoutineCatalogItem<RoutineGoalId>[] = [
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

export const ROUTINE_LOCATION_CATALOG: RoutineCatalogItem<RoutineLocationId>[] = [
  { id: 'home', label: 'Casa' },
  { id: 'gym', label: 'Gimnasio' },
];

export function routineLabelById<T extends string>(
  catalog: RoutineCatalogItem<T>[],
  id: string
): string {
  return catalog.find((c) => c.id === id)?.label ?? id;
}

export function routineToPrimeOptions<T extends string>(
  catalog: RoutineCatalogItem<T>[]
): { label: string; value: T }[] {
  return catalog.map(({ id, label }) => ({ label, value: id }));
}

// ─── Exercise slot ────────────────────────────────────────────────────────────

/**
 * An exercise slot inside a training day.
 * Stores only a reference (`exerciseId`) — never duplicates exercise data.
 * Designed so the AI can load a template, swap exercises, and assign to a user
 * without modifying the original template.
 */
export interface RoutineExercise {
  /** Client-side UUID for stable list tracking within the template. */
  exId: string;
  /** Reference to `exercise-library/{exerciseId}`. */
  exerciseId: string;
  /** Display order within the day (0-based). */
  order: number;

  // ── Training parameters ──────────────────────────────────────────────────
  sets: number;
  repsMin: number;
  repsMax: number;
  /** Rest between sets, in seconds. */
  restSeconds: number;
  /** Tempo notation: eccentric-pause-concentric-pause, e.g. "3-1-2-0". */
  tempo: string;
  /** Reps in Reserve (0 = to failure, 1-5 = buffer). */
  rir: number;
  notes: string;
}

// ─── Training day ─────────────────────────────────────────────────────────────

export interface RoutineDay {
  /** Client-side UUID for stable tab/list tracking. */
  dayId: string;
  /** User-visible name, e.g. "Día A – Empuje". */
  name: string;
  /** Display order within the routine (0-based). */
  order: number;
  exercises: RoutineExercise[];
}

// ─── Routine template ─────────────────────────────────────────────────────────

/**
 * A routine template stored in `routine-library/{routineId}`.
 *
 * Design for AI compatibility:
 * - `isTemplate: true` = admin-authored master template (never modified).
 * - When the AI assigns a routine to a user it creates a *copy* with
 *   `isTemplate: false` in the user's sub-collection, leaving this untouched.
 * - `days[].exercises[].exerciseId` is a stable reference; the AI can swap
 *   individual `exerciseId` values without touching the rest of the structure.
 */
export interface RoutineTemplate {
  id: string;

  name: string;
  description: string;

  difficulty: RoutineDifficultyId;
  daysPerWeek: number;

  goals: RoutineGoalId[];
  tags: string[];
  trainingLocations: RoutineLocationId[];

  days: RoutineDay[];

  isActive: boolean;
  /** True for admin-authored master templates; false for user-assigned copies. */
  isTemplate: boolean;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Payload types ────────────────────────────────────────────────────────────

export type RoutineCreatePayload = Omit<RoutineTemplate, 'id' | 'createdAt' | 'updatedAt'>;
export type RoutineUpdatePayload = Partial<RoutineCreatePayload>;

// ─── Default exercise slot ────────────────────────────────────────────────────

export function defaultExerciseSlot(exerciseId: string, order: number): RoutineExercise {
  return {
    exId: crypto.randomUUID(),
    exerciseId,
    order,
    sets: 3,
    repsMin: 8,
    repsMax: 12,
    restSeconds: 90,
    tempo: '2-0-2-0',
    rir: 2,
    notes: '',
  };
}

// ─── Default day ─────────────────────────────────────────────────────────────

export function defaultDay(order: number): RoutineDay {
  return {
    dayId: crypto.randomUUID(),
    name: `Día ${order + 1}`,
    order,
    exercises: [],
  };
}
