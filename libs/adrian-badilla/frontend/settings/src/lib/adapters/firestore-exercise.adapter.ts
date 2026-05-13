import type { FirestoreExercise } from '../types/firestore-routine.types';
import type { Routine, RoutineDay } from './decision-item.adapters';
import type { ExerciseMock } from '../mocks/exercises.mock';

// ─── Internal helpers ─────────────────────────────────────────────────────────

function formatMinutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

// ─── Public adapters ─────────────────────────────────────────────────────────

/**
 * Transforms a flat list of Firestore exercises into `RoutineDay[]`.
 *
 * Strategy:
 * - Group exercises by the `day` field (e.g. "Lunes").
 * - Sort groups by `dayOrder` (ascending).
 * - Within each group, sort exercises by `order` (ascending).
 * - Each group becomes ONE `RoutineDay` with ONE `Routine` item containing
 *   all exercise names. This matches the Firebase structure where exercises
 *   have no explicit muscle-group / block metadata.
 *
 * The resulting array is ready to be consumed by `SharedItemTimelineComponent`.
 */
export function groupExercisesByDay(exercises: FirestoreExercise[]): RoutineDay[] {
  // 1️⃣ Group
  const grouped = new Map<string, FirestoreExercise[]>();
  for (const ex of exercises) {
    const bucket = grouped.get(ex.day) ?? [];
    bucket.push(ex);
    grouped.set(ex.day, bucket);
  }

  // 2️⃣ Sort groups by dayOrder, exercises within each group by order
  return Array.from(grouped.entries())
    .sort(([, a], [, b]) => (a[0]?.dayOrder ?? 0) - (b[0]?.dayOrder ?? 0))
    .map(([day, exs]) => {
      const sorted = [...exs].sort((a, b) => a.order - b.order);
      const firstTime = sorted[0]?.time ?? 0;

      const routine: Routine = {
        id: `${day.toLowerCase()}-routine`,
        name: day,
        time: formatMinutesToTime(firstTime),
        status: 'pending',
        exercises: sorted.map((ex) => ex.name),
      };

      return {
        id: day.toLowerCase(),
        label: day,
        date: '',
        routines: [routine],
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
  exercises: FirestoreExercise[],
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
