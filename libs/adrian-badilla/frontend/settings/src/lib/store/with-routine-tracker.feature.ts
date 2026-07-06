/**
 * 🏋️ ROUTINE PROGRESS TRACKER FEATURE
 *
 * Pure calculation functions for routine progress metrics.
 * Follows the same architecture as `with-macro-tracker.feature.ts`:
 *  - Exported pure functions (used directly in computed() signals)
 *  - No side effects, no store dependency — fully testable
 */

import type { RoutineDay } from '../adapters/decision-item.adapters';
import type {
  PersonalRecord,
  RoutineProgressMetrics,
  RoutineSessionRecord,
} from '../types/routine-progress.types';
import {
  EXERCISE_BENCHMARKS,
  MOCK_PERSONAL_RECORDS,
  MOCK_SESSION_HISTORY,
} from '../mock/mock-routine-progress.data';

// ─── Simulated "today" for mock purposes ────────────────────────────────────
// Matches the project's current date context so the streak calculates correctly.
const SIMULATED_TODAY = '2026-05-11';

// ─── 1. Completion percentage ─────────────────────────────────────────────────

export interface CompletionResult {
  percentage: number;
  completed: number;
  total: number;
}

/**
 * Calculates how many routines in the selected day are completed.
 * Returns percentage (0–100), plus raw counts.
 */
export function calculateCompletionPercentage(
  days: RoutineDay[],
  selectedDayId: string
): CompletionResult {
  const day = days.find((d) => d.id === selectedDayId);
  if (!day || day.routines.length === 0) {
    return { percentage: 0, completed: 0, total: 0 };
  }

  const total = day.routines.length;
  const completed = day.routines.filter((r) => r.status === 'completed').length;

  return {
    percentage: Math.round((completed / total) * 100),
    completed,
    total,
  };
}

// ─── 2. Volume load (tonnage) ─────────────────────────────────────────────────

/**
 * Calculates total volume load (sets × reps × weight) for all COMPLETED
 * routines in the selected day, using benchmark working weights.
 */
export function calculateRoutineVolume(
  days: RoutineDay[],
  selectedDayId: string
): number {
  const day = days.find((d) => d.id === selectedDayId);
  if (!day) return 0;

  return day.routines
    .filter((r) => r.status === 'completed')
    .flatMap((r) => r.exercises)
    .reduce((total, exerciseName) => {
      const bench = EXERCISE_BENCHMARKS[exerciseName];
      if (!bench) return total;
      return total + bench.sets * bench.reps * bench.weight;
    }, 0);
}

// ─── 3. Training streak ───────────────────────────────────────────────────────

/**
 * Counts consecutive training days up to and including today.
 * `currentDayComplete` indicates if today's session is finished (so it counts).
 */
export function calculateStreak(
  sessionHistory: RoutineSessionRecord[],
  currentDayComplete: boolean
): number {
  const dateSet = new Set(
    sessionHistory
      .filter((s) => s.completedRoutineIds.length > 0)
      .map((s) => s.date)
  );

  const today = new Date(SIMULATED_TODAY);
  let streak = currentDayComplete ? 1 : 0;

  // Walk backwards from yesterday (or today if not complete)
  const checkFrom = new Date(today);
  if (currentDayComplete) checkFrom.setDate(checkFrom.getDate() - 1);

  for (let i = 0; i < 365; i++) {
    const dateStr = checkFrom.toISOString().split('T')[0];
    if (dateSet.has(dateStr)) {
      streak++;
      checkFrom.setDate(checkFrom.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// ─── 4. PR detection ──────────────────────────────────────────────────────────

/**
 * Detects new personal records: any exercise in a COMPLETED routine whose
 * benchmark weight exceeds the historical best.
 */
export function detectNewPRs(
  days: RoutineDay[],
  selectedDayId: string,
  historicalPRs: PersonalRecord[]
): PersonalRecord[] {
  const day = days.find((d) => d.id === selectedDayId);
  if (!day) return [];

  const prMap = new Map(historicalPRs.map((pr) => [pr.exercise, pr.weight]));
  const seen = new Set<string>(); // avoid duplicates if same exercise appears in multiple routines
  const newPRs: PersonalRecord[] = [];

  day.routines
    .filter((r) => r.status === 'completed')
    .flatMap((r) => r.exercises)
    .forEach((exerciseName) => {
      if (seen.has(exerciseName)) return;
      seen.add(exerciseName);

      const bench = EXERCISE_BENCHMARKS[exerciseName];
      if (!bench) return;

      const historicalBest = prMap.get(exerciseName) ?? 0;
      if (bench.weight > historicalBest) {
        newPRs.push({
          exercise: exerciseName,
          weight: bench.weight,
          date: SIMULATED_TODAY,
        });
      }
    });

  return newPRs;
}

// ─── 5. Estimated duration ────────────────────────────────────────────────────

/**
 * Estimates session duration based on total exercises in the selected day.
 * Rule of thumb: ~5 min per exercise (3 sets + rest between sets).
 * Also adds a 5-min warm-up base.
 */
export function estimateRoutineDuration(
  days: RoutineDay[],
  selectedDayId: string
): number {
  const day = days.find((d) => d.id === selectedDayId);
  if (!day) return 0;

  const totalExercises = day.routines.flatMap((r) => r.exercises).length;
  return 5 + totalExercises * 5; // warm-up + per-exercise estimate
}

// ─── 6. Motivation message ────────────────────────────────────────────────────

/**
 * Returns a contextual motivation message based on current progress.
 */
export function generateRoutineMotivationMessage(
  percentage: number,
  isComplete: boolean,
  streak: number
): string {
  if (isComplete && streak >= 7) return '🏆 ¡Semana perfecta! Eres imparable';
  if (isComplete) return '🎉 ¡Rutina completada! Gran sesión';
  if (percentage >= 75) return '🔥 ¡Casi listo! Un último esfuerzo';
  if (percentage >= 50) return '💪 Vas muy bien, ¡sigue así!';
  if (percentage >= 25) return '⚡ Buen inicio, ¡mantén el ritmo!';
  if (percentage > 0) return '🏋️ ¡Comenzaste! Cada rep cuenta';
  return '🎯 ¡Empieza tu rutina de hoy!';
}

// ─── 7. Master computation ────────────────────────────────────────────────────

/**
 * Single entry-point that computes all routine progress metrics.
 * Call this inside a `computed()` signal in your component or store.
 *
 * @example
 * ```ts
 * readonly progressMetrics = computed(() =>
 *   calculateRoutineProgressMetrics(this.days(), this.selectedDayId())
 * );
 * ```
 */
export function calculateRoutineProgressMetrics(
  days: RoutineDay[],
  selectedDayId: string,
  sessionHistory: RoutineSessionRecord[] = MOCK_SESSION_HISTORY,
  historicalPRs: PersonalRecord[] = MOCK_PERSONAL_RECORDS
): RoutineProgressMetrics {
  const { percentage, completed, total } = calculateCompletionPercentage(
    days,
    selectedDayId
  );
  const isComplete = percentage === 100 && total > 0;

  const totalVolume = calculateRoutineVolume(days, selectedDayId);
  const newPRs = detectNewPRs(days, selectedDayId, historicalPRs);
  const estimatedDurationMinutes = estimateRoutineDuration(days, selectedDayId);
  const streak = calculateStreak(sessionHistory, isComplete);
  const motivationMessage = generateRoutineMotivationMessage(
    percentage,
    isComplete,
    streak
  );

  return {
    completionPercentage: percentage,
    completedCount: completed,
    totalCount: total,
    totalVolume,
    streak,
    estimatedDurationMinutes,
    newPRs,
    motivationMessage,
    isComplete,
  };
}
