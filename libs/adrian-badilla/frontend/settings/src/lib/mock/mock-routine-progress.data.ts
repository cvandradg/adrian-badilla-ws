import type {
  ExerciseBenchmark,
  PersonalRecord,
  RoutineSessionRecord,
} from '../types/routine-progress.types';

// ─── Exercise benchmarks ─────────────────────────────────────────────────────
// Typical intermediate working weights.
// Volume = sets × reps × weight (kg).

export const EXERCISE_BENCHMARKS: Record<string, ExerciseBenchmark> = {
  // ── Pierna ─────────────────────────────────────────
  'Squat':              { name: 'Squat',              sets: 4, reps: 12, weight: 80  },
  'Leg Press':          { name: 'Leg Press',          sets: 3, reps: 15, weight: 120 },
  'Lunges':             { name: 'Lunges',             sets: 3, reps: 10, weight: 20  },
  'Leg Extension':      { name: 'Leg Extension',      sets: 3, reps: 12, weight: 50  },
  'Romanian Deadlift':  { name: 'Romanian Deadlift',  sets: 4, reps: 10, weight: 70  },
  'Calf Raise':         { name: 'Calf Raise',         sets: 4, reps: 15, weight: 60  },
  // ── Pecho ──────────────────────────────────────────
  'Bench Press':        { name: 'Bench Press',        sets: 4, reps: 10, weight: 80  },
  'Incline Press':      { name: 'Incline Press',      sets: 3, reps: 10, weight: 60  },
  'Cable Fly':          { name: 'Cable Fly',          sets: 3, reps: 12, weight: 30  },
  // ── Espalda ────────────────────────────────────────
  'Pull-Up':            { name: 'Pull-Up',            sets: 4, reps: 8,  weight: 10  }, // +10 kg cinturón
  'Barbell Row':        { name: 'Barbell Row',        sets: 4, reps: 10, weight: 70  },
  'Lat Pulldown':       { name: 'Lat Pulldown',       sets: 3, reps: 12, weight: 65  },
  // ── Hombros ────────────────────────────────────────
  'Overhead Press':     { name: 'Overhead Press',     sets: 4, reps: 8,  weight: 55  },
  'Lateral Raise':      { name: 'Lateral Raise',      sets: 3, reps: 15, weight: 15  },
  // ── Bíceps ─────────────────────────────────────────
  'Barbell Curl':       { name: 'Barbell Curl',       sets: 3, reps: 12, weight: 40  },
  'Hammer Curl':        { name: 'Hammer Curl',        sets: 3, reps: 12, weight: 20  },
  // ── Tríceps ────────────────────────────────────────
  'Dips':               { name: 'Dips',               sets: 4, reps: 10, weight: 10  }, // +10 kg cinturón
  'Skull Crushers':     { name: 'Skull Crushers',     sets: 3, reps: 12, weight: 35  },
};

// ─── Session history (last ~30 days) ─────────────────────────────────────────
// Today = 2026-05-11. Consecutive streak May 5–10 (6 days).
// A break on May 4 (rest day), then another streak Apr 27–May 3.

export const MOCK_SESSION_HISTORY: RoutineSessionRecord[] = [
  { date: '2026-05-10', dayLabel: 'Domingo',   completedRoutineIds: ['r7'],       totalVolume: 3_960,  durationMinutes: 48 },
  { date: '2026-05-09', dayLabel: 'Sábado',    completedRoutineIds: ['r6'],       totalVolume: 6_600,  durationMinutes: 55 },
  { date: '2026-05-08', dayLabel: 'Viernes',   completedRoutineIds: ['r4', 'r5'], totalVolume: 5_490,  durationMinutes: 60 },
  { date: '2026-05-07', dayLabel: 'Jueves',    completedRoutineIds: ['r3'],       totalVolume: 6_520,  durationMinutes: 56 },
  { date: '2026-05-06', dayLabel: 'Miércoles', completedRoutineIds: ['r1', 'r2'], totalVolume: 9_240,  durationMinutes: 70 },
  { date: '2026-05-05', dayLabel: 'Martes',    completedRoutineIds: ['r7'],       totalVolume: 3_800,  durationMinutes: 46 },
  // rest day: 2026-05-04 (break in streak)
  { date: '2026-05-03', dayLabel: 'Domingo',   completedRoutineIds: ['r6'],       totalVolume: 6_200,  durationMinutes: 53 },
  { date: '2026-05-02', dayLabel: 'Sábado',    completedRoutineIds: ['r4'],       totalVolume: 3_180,  durationMinutes: 44 },
  { date: '2026-05-01', dayLabel: 'Viernes',   completedRoutineIds: ['r3'],       totalVolume: 6_380,  durationMinutes: 55 },
  { date: '2026-04-30', dayLabel: 'Jueves',    completedRoutineIds: ['r1', 'r2'], totalVolume: 8_760,  durationMinutes: 66 },
  { date: '2026-04-29', dayLabel: 'Miércoles', completedRoutineIds: ['r7'],       totalVolume: 3_720,  durationMinutes: 47 },
  { date: '2026-04-28', dayLabel: 'Martes',    completedRoutineIds: ['r6'],       totalVolume: 6_100,  durationMinutes: 51 },
  { date: '2026-04-27', dayLabel: 'Lunes',     completedRoutineIds: ['r4', 'r5'], totalVolume: 5_250,  durationMinutes: 58 },
  { date: '2026-04-26', dayLabel: 'Domingo',   completedRoutineIds: ['r3'],       totalVolume: 6_300,  durationMinutes: 54 },
  { date: '2026-04-25', dayLabel: 'Sábado',    completedRoutineIds: ['r1', 'r2'], totalVolume: 8_900,  durationMinutes: 68 },
  { date: '2026-04-24', dayLabel: 'Viernes',   completedRoutineIds: ['r7'],       totalVolume: 3_650,  durationMinutes: 45 },
  { date: '2026-04-23', dayLabel: 'Jueves',    completedRoutineIds: ['r6'],       totalVolume: 6_050,  durationMinutes: 50 },
];

// ─── Historical Personal Records ─────────────────────────────────────────────
// Some are set slightly BELOW the benchmark weight so PR detection fires
// when the user completes those exercises for the first time in the session.

export const MOCK_PERSONAL_RECORDS: PersonalRecord[] = [
  // Pierna — Squat and Romanian Deadlift below benchmark to allow PR detection
  { exercise: 'Squat',             weight: 75,  date: '2026-04-20' }, // bench=80  → new PR!
  { exercise: 'Leg Press',         weight: 120, date: '2026-04-26' },
  { exercise: 'Lunges',            weight: 20,  date: '2026-04-15' },
  { exercise: 'Leg Extension',     weight: 50,  date: '2026-04-27' },
  { exercise: 'Romanian Deadlift', weight: 65,  date: '2026-04-28' }, // bench=70  → new PR!
  { exercise: 'Calf Raise',        weight: 60,  date: '2026-04-20' },
  // Pecho — Bench Press below benchmark
  { exercise: 'Bench Press',       weight: 77,  date: '2026-04-26' }, // bench=80  → new PR!
  { exercise: 'Incline Press',     weight: 60,  date: '2026-04-27' },
  { exercise: 'Cable Fly',         weight: 30,  date: '2026-04-22' },
  // Espalda — Pull-Up below benchmark
  { exercise: 'Pull-Up',           weight: 8,   date: '2026-04-24' }, // bench=10  → new PR!
  { exercise: 'Barbell Row',       weight: 70,  date: '2026-04-26' },
  { exercise: 'Lat Pulldown',      weight: 65,  date: '2026-04-28' },
  // Hombros — Overhead Press below benchmark
  { exercise: 'Overhead Press',    weight: 52,  date: '2026-04-20' }, // bench=55  → new PR!
  { exercise: 'Lateral Raise',     weight: 15,  date: '2026-04-27' },
  // Bíceps — Barbell Curl below benchmark
  { exercise: 'Barbell Curl',      weight: 37,  date: '2026-04-24' }, // bench=40  → new PR!
  { exercise: 'Hammer Curl',       weight: 20,  date: '2026-04-26' },
  // Tríceps — Dips below benchmark
  { exercise: 'Dips',              weight: 8,   date: '2026-04-24' }, // bench=10  → new PR!
  { exercise: 'Skull Crushers',    weight: 35,  date: '2026-04-26' },
];
