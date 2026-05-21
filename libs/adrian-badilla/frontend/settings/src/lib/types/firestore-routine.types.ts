/**
 * Raw shape of an exercise document stored under:
 *   users/{uid}/routines/{routineId}/exercices/{exerciseId}
 *
 * Field names must match Firestore exactly (including the "exercices" typo
 * in the collection name, which lives only in the path helper).
 */
export interface FirestoreExercise {
  id: string;
  /**
   * Days of the week when this exercise is performed.
   * (e.g. ["Lunes", "Miércoles", "Viernes"])
   *
   * A single exercise document can appear in multiple timeline days without
   * duplication in Firestore. If absent or empty, the adapter falls back to
   * the legacy `day` field, then to "Other".
   */
  days?: string[];
  /**
   * @deprecated Use `days` instead.
   * Kept for backward compatibility with documents written before the
   * multi-day migration. The adapter auto-converts: days = [day].
   */
  day?: string;
  /**
   * @deprecated Redundant once `days` is the source of truth.
   * Sort order is now derived from the canonical week-day map in
   * `exercise-grouping.utils.ts` (`WEEK_ORDER`).
   */
  dayOrder?: number;
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
  /**
   * Muscle-group / movement-pattern label used for card grouping
   * (e.g. "Push", "Pull", "Legs"). Optional — exercises without this
   * field are grouped under "Other" by `groupExercisesByType`.
   */
  type?: string;
}
