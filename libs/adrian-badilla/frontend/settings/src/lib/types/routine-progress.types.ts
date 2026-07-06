// ─── Exercise benchmark (mock working weight) ───────────────────────────────

/**
 * Typical working benchmark for an exercise.
 * Used to compute volume and detect PRs without real user tracking data.
 */
export interface ExerciseBenchmark {
  name: string;
  sets: number;
  reps: number;
  weight: number; // kg
}

// ─── Personal Record ─────────────────────────────────────────────────────────

export interface PersonalRecord {
  exercise: string;
  weight: number; // best weight ever lifted (kg)
  date: string;   // YYYY-MM-DD
}

// ─── Session history ─────────────────────────────────────────────────────────

/**
 * A single completed training session.
 * Used to calculate streaks, volume history and compare against PRs.
 */
export interface RoutineSessionRecord {
  date: string;                    // YYYY-MM-DD
  dayLabel: string;                // human-readable label, e.g. 'Lunes'
  completedRoutineIds: string[];   // which routines were finished
  totalVolume: number;             // pre-computed volume (kg)
  durationMinutes: number;
}

// ─── Computed metrics (output of the tracker) ───────────────────────────────

export interface RoutineProgressMetrics {
  completionPercentage: number;    // 0-100
  completedCount: number;          // routines done in selected day
  totalCount: number;              // total routines in selected day
  totalVolume: number;             // sets × reps × weight for completed routines
  streak: number;                  // consecutive training days (including today if complete)
  estimatedDurationMinutes: number;
  newPRs: PersonalRecord[];        // exercises where current benchmark exceeds historical best
  motivationMessage: string;
  isComplete: boolean;
}
