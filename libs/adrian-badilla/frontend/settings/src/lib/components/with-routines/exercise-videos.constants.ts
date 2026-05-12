/**
 * Exercise video URL map.
 * Keys match the exercise names used in Routine.exercises.
 * Values are autoplayable short video/GIF URLs (mp4 preferred).
 *
 * Replace empty strings with real CDN URLs as exercise media is available.
 */
export const EXERCISE_VIDEOS: Record<string, string> = {
  // ── Pierna ─────────────────────────────────────────────────────────────
  'Squat': '/global/assets/videos/15079385_1080_1920_30fps.mp4',
  'Leg Press': '',
  'Lunges': '',
  'Leg Extension': '',
  'Romanian Deadlift': '',
  'Calf Raise': '',

  // ── Pecho ──────────────────────────────────────────────────────────────
  'Bench Press': '',
  'Incline Press': '',
  'Cable Fly': '',

  // ── Espalda ────────────────────────────────────────────────────────────
  'Pull-Up': '',
  'Barbell Row': '',
  'Lat Pulldown': '',

  // ── Hombros ────────────────────────────────────────────────────────────
  'Overhead Press': '',
  'Lateral Raise': '',

  // ── Bíceps / Tríceps ───────────────────────────────────────────────────
  'Barbell Curl': '',
  'Hammer Curl': '',
  'Dips': '',
  'Skull Crushers': '',
};
