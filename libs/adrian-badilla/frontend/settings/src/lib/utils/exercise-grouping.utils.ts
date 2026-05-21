/**
 * Pure utilities for grouping and expanding exercises.
 * Extracted here to keep adapters and store features lean and testable.
 */

// ─── Day ordering ─────────────────────────────────────────────────────────────

/**
 * Canonical ordered list of Spanish week-day names (Mon → Sun).
 * Exported so other modules can seed or sort by this reference.
 */
export const DAYS_ORDER = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
] as const;

/**
 * Canonical sort order for Spanish week-day names.
 * Day names not listed here receive order 99 and sort to the end.
 */
const WEEK_ORDER: Record<string, number> = {
  Lunes: 1,
  Martes: 2,
  Miércoles: 3,
  Jueves: 4,
  Viernes: 5,
  Sábado: 6,
  Domingo: 7,
};

/** Returns the canonical sort position for a day name. Unknown days sort last. */
export function getDayOrder(day: string): number {
  return WEEK_ORDER[day] ?? 99;
}

// ─── Day name canonicalization ────────────────────────────────────────────────

/**
 * Maps accent-stripped lowercase day names → canonical Spanish day names.
 * Handles Firestore data stored without accents (e.g. "Miercoles", "Sabado").
 */
const NORMALIZED_TO_CANONICAL: Record<string, string> = {
  lunes:     'Lunes',
  martes:    'Martes',
  miercoles: 'Miércoles',
  jueves:    'Jueves',
  viernes:   'Viernes',
  sabado:    'Sábado',
  domingo:   'Domingo',
};

/**
 * Converts any day-name variant to the canonical accented form.
 * e.g. "Miercoles", "miércoles", "MIERCOLES" → "Miércoles"
 */
export function canonicalDayName(day: string): string {
  const key = day
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip combining accents
    .toLowerCase()
    .trim();
  return NORMALIZED_TO_CANONICAL[key] ?? day;
}

// ─── Multi-day normalization ──────────────────────────────────────────────────

/** Fallback used when an exercise has no day information at all. */
const EXERCISE_DEFAULT_DAY = 'Other';

/**
 * Resolves the `days` array for an exercise, handling backward compatibility
 * with the legacy single-value `day` field.
 *
 * Resolution order:
 * 1. `days` array (new format) — used as-is when non-empty.
 * 2. Legacy `day` string — wrapped in an array: `[day]`.
 * 3. Empty / missing — returns `[EXERCISE_DEFAULT_DAY]`.
 */
export function normalizeDays(ex: { day?: string; days?: string[] }): string[] {
  if (ex.days && ex.days.length > 0) return ex.days.map(canonicalDayName);
  if (ex.day) return [canonicalDayName(ex.day)];
  return [EXERCISE_DEFAULT_DAY];
}

// ─── Type grouping ────────────────────────────────────────────────────────────

/** Fallback label used when an exercise has no `type` defined. */
const EXERCISE_DEFAULT_TYPE = 'Other';

/**
 * Groups an array of exercise-like objects by their `type` property.
 *
 * - Items without a `type` (or with an empty/whitespace string) are
 *   collected under `EXERCISE_DEFAULT_TYPE`.
 * - Insertion order of keys reflects the order of first occurrence,
 *   so the caller controls sort order by sorting the input beforehand.
 */
export function groupExercisesByType<T extends { type?: string }>(
  exercises: T[],
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();

  for (const ex of exercises) {
    const key = ex.type?.trim() || EXERCISE_DEFAULT_TYPE;
    const bucket = grouped.get(key) ?? [];
    bucket.push(ex);
    grouped.set(key, bucket);
  }

  return grouped;
}
