/**
 * Raw shape of an exercise document stored under:
 *   users/{uid}/routines/{routineId}/exercices/{exerciseId}
 *
 * Field names must match Firestore exactly (including the "exercices" typo
 * in the collection name, which lives only in the path helper).
 */
export interface FirestoreExercise {
  id: string;
  /** Human-readable day label (e.g. "Lunes") — used as the RoutineDay key. */
  day: string;
  /** Sort order for the day within the week (1 = Monday … 7 = Sunday). */
  dayOrder: number;
  /** Coaching description displayed in the exercise popover. */
  description: string;
  /** Exercise name key (e.g. "Squat") — must be unique within the routine. */
  name: string;
  /** Sort order within the day (1-based). */
  order: number;
  /** Target repetitions for a standard set. */
  targetReps: number;
  /** Workout time — stored as total minutes since midnight (e.g. 600 = 10:00). */
  time: number;
  /** URL to the instructional video asset (empty string if unavailable). */
  videoUrl: string;
}
