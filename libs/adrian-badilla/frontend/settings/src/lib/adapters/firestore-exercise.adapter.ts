import type { FirestoreExercise } from '../types/firestore-routine.types';
import type { Routine, RoutineDay } from './decision-item.adapters';
import type { ExerciseMock } from '../mock/exercises.mock';
import {
  DAYS_ORDER,
  getDayOrder,
  groupExercisesByType,
  normalizeDays,
} from '../utils/exercise-grouping.utils';

// ─── Internal helpers ─────────────────────────────────────────────────────────

function formatMinutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

// ─── Public adapters ─────────────────────────────────────────────────────────

/**
 * Transforms a flat list of Firestore exercises into `RoutineDay[]`.
 *
 * Strategy:
 * 1. Expand each exercise into every day listed in its `days` array.
 *    Legacy `day` string (pre-migration) is handled by `normalizeDays()`.
 * 2. Sort the resulting day groups by canonical week order (`WEEK_ORDER`).
 * 3. Within each day, sort exercises by `order` then sub-group by `type`.
 * 4. Each `type` group becomes its own `Routine` card (title = type value).
 *    Exercises without a `type` land in an "Other" card.
 *
 * The resulting array is ready to be consumed by `SharedItemTimelineComponent`.
 */
export function groupExercisesByDay(
  exercises: FirestoreExercise[]
): RoutineDay[] {
  // 1️⃣ Expand: one exercise can belong to multiple days.
  //    Seed all canonical days first so they are present in correct order
  //    even when Firebase returns no exercises for a day (e.g. Domingo).
  const byDay = new Map<string, FirestoreExercise[]>(
    DAYS_ORDER.map((d) => [d, []])
  );
  for (const ex of exercises) {
    for (const day of normalizeDays(ex)) {
      const bucket = byDay.get(day) ?? [];
      bucket.push(ex);
      byDay.set(day, bucket);
    }
  }

  // 2️⃣ Sort day groups by canonical week order
  return Array.from(byDay.entries())
    .sort(([a], [b]) => getDayOrder(a) - getDayOrder(b))
    .map(([day, dayExercises]) => {
      const sorted = [...dayExercises].sort((a, b) => a.order - b.order);

      // 3️⃣ Sub-group by type → one Routine card per type group
      const byType = groupExercisesByType(sorted);

      const routines: Routine[] = Array.from(byType.entries()).map(
        ([type, typeExercises]) => ({
          id: `${day.toLowerCase()}-${type.toLowerCase().replace(/\s+/g, '-')}`,
          name: type,
          type,
          time: formatMinutesToTime(typeExercises[0]?.time ?? 0),
          status: 'pending' as const,
          exercises: typeExercises.map((ex) => ex.name),
        })
      );

      return {
        id: day.toLowerCase(),
        label: day,
        date: '',
        routines,
      } satisfies RoutineDay;
    });
}

/**
 * Builds a lookup map keyed by exercise name so the popover component can
 * retrieve description / video / targetReps without a Firestore round-trip.
 *
 * The value shape intentionally matches `ExerciseMock` so the existing
 * `ExercisePopoverComponent` and `RoutinesOverlayService` need zero changes.
 */
export function buildExerciseLookup(
  exercises: FirestoreExercise[]
): Record<string, ExerciseMock> {
  return exercises.reduce<Record<string, ExerciseMock>>((acc, ex) => {
    acc[ex.name] = {
      name: ex.name,
      videoUrl: ex.videoUrl,
      description: ex.description,
      targetReps: ex.targetReps,
    };
    return acc;
  }, {});
}
