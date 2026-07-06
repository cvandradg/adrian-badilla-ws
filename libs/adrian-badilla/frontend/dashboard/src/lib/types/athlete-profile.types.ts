import type { Timestamp } from 'firebase/firestore';

// ─── Enums / union literals ────────────────────────────────────────────────────

export type TrainingExperience = 'beginner' | 'intermediate' | 'advanced';

export type TrainingGoal =
  | 'lose_fat'
  | 'gain_muscle'
  | 'body_recomposition'
  | 'sports_performance'
  | 'maintain_weight';

export type TrainingConsistency = 'low' | 'medium' | 'high';

export type PreferredSchedule = 'morning' | 'midday' | 'afternoon' | 'evening';

/** Where the user trains. Controls equipment selector visibility and AI routine filtering. */
export type TrainingLocation = 'gym' | 'home' | 'both';

/**
 * User's preferred workout style.
 * The AI Coach uses this to structure session volume and rest periods.
 */
export type TrainingStylePreference = 'short' | 'medium' | 'long';

/**
 * Severity levels for injuries and diseases.
 * 'severe' triggers a manual-review flag so the AI Coach defers to a human trainer.
 */
export type InjurySeverity = 'minor' | 'moderate' | 'severe';
export type DiseaseSeverity = 'minor' | 'moderate' | 'severe';

export type AlcoholFrequency = 'never' | 'occasionally' | 'frequent';

export type MealSlot =
  | 'breakfast'
  | 'mid_morning'
  | 'lunch'
  | 'afternoon_snack'
  | 'dinner'
  | 'post_workout';

// ─── Sub-documents ────────────────────────────────────────────────────────────

export interface AthleteProfileTraining {
  sport: string;
  trainingExperience: TrainingExperience;
  trainingType: string;
  goal: TrainingGoal;
  /** Days of the week the user can train. e.g. ['monday', 'wednesday', 'friday'] */
  availableDays: string[];
  preferredSchedule: PreferredSchedule;
  /** Training session duration in minutes. */
  sessionDuration: number;
  trainingConsistency: TrainingConsistency;
  /** Available equipment identifiers. e.g. ['full_gym', 'dumbbells'] */
  availableEquipment: string[];

  // ── AI-ready fields (all optional for backward compatibility) ─────────────────────

  /**
   * Where the user trains.
   * AI Coach: filters compatible exercises, adapts equipment substitutions.
   */
  trainingLocation?: TrainingLocation;

  /**
   * User's preferred session length and intensity style.
   * AI Coach: determines volume, rest periods, and exercise density.
   */
  trainingStylePreference?: TrainingStylePreference;

  /**
   * Months of consistent training experience.
   * AI Coach: refines experience-level assessment for load progression.
   */
  monthsTraining?: number;

  /**
   * Optional secondary training goal.
   * AI Coach: adds complementary programming blocks alongside the primary goal.
   */
  secondaryGoal?: TrainingGoal;

  /**
   * Muscle groups to emphasize in generated routines.
   * AI Coach: increases frequency and volume for these groups.
   */
  priorityMuscles?: string[];

  /**
   * Muscle groups to exclude or minimize.
   * AI Coach: removes or substitutes exercises targeting these groups.
   * Useful for mild discomfort that doesn't warrant a full injury description.
   */
  avoidMuscles?: string[];
}

export interface AthleteProfileNutrition {
  followsDiet: boolean;
  mealSchedule: MealSlot[];
  foodIntolerances: string;
}

export interface AthleteProfileHealth {
  hasDisease: boolean;
  diseaseDescription: string;
  hasInjury: boolean;
  injuryDescription: string;

  // ── AI-ready fields (optional for backward compatibility) ───────────────────────

  /**
   * Severity of the reported injury.
   * AI Coach: 'severe' triggers a manual-review flag and skips auto-generation.
   */
  injurySeverity?: InjurySeverity;

  /**
   * Severity of the reported disease or medical condition.
   * AI Coach: 'severe' blocks automatic routine generation entirely.
   */
  diseaseSeverity?: DiseaseSeverity;
}

export interface AthleteProfileLifestyle {
  profession: string;
  smoker: boolean;
  alcohol: AlcoholFrequency;
}

// ─── Root document field ──────────────────────────────────────────────────────

/**
 * Stored as `users/{uid}.athleteProfile` in Firestore.
 * Heights, weights, age, and body fat are NOT duplicated here —
 * those already exist on `users/{uid}` via the physical onboarding flow.
 */
export interface AthleteProfile {
  completed: boolean;
  completedAt: Timestamp | null;
  updatedAt: Timestamp;
  training: AthleteProfileTraining;
  nutrition: AthleteProfileNutrition;
  health: AthleteProfileHealth;
  lifestyle: AthleteProfileLifestyle;
}

// ─── Form payload ─────────────────────────────────────────────────────────────

/** Data collected by the form — no Firestore timestamps. */
export interface AthleteProfileFormData {
  training: AthleteProfileTraining;
  nutrition: AthleteProfileNutrition;
  health: AthleteProfileHealth;
  lifestyle: AthleteProfileLifestyle;
}

// ─── Display helpers ──────────────────────────────────────────────────────────

export const TRAINING_EXPERIENCE_LABELS: Record<TrainingExperience, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

export const TRAINING_GOAL_LABELS: Record<TrainingGoal, string> = {
  lose_fat: 'Bajar grasa',
  gain_muscle: 'Ganar músculo',
  body_recomposition: 'Recomposición corporal',
  sports_performance: 'Rendimiento deportivo',
  maintain_weight: 'Mantener peso',
};

export const TRAINING_CONSISTENCY_LABELS: Record<TrainingConsistency, string> =
  {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
  };

export const PREFERRED_SCHEDULE_LABELS: Record<PreferredSchedule, string> = {
  morning: 'Mañana',
  midday: 'Mediodía',
  afternoon: 'Tarde',
  evening: 'Noche',
};

export const ALCOHOL_FREQUENCY_LABELS: Record<AlcoholFrequency, string> = {
  never: 'Nunca',
  occasionally: 'Ocasionalmente',
  frequent: 'Frecuente',
};

export const MEAL_SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: 'Desayuno',
  mid_morning: 'Media mañana',
  lunch: 'Almuerzo',
  afternoon_snack: 'Merienda',
  dinner: 'Cena',
  post_workout: 'Post-entreno',
};

export const TRAINING_TYPE_OPTIONS: string[] = [
  'Fuerza',
  'Cardio',
  'HIIT',
  'CrossFit',
  'Yoga / Pilates',
  'Artes marciales',
  'Natación',
  'Ciclismo',
  'Mixto',
  'Otro',
];

/** Predefined sport options for the sport select. 'Otro' triggers a free-text input. */
export const SPORT_OPTIONS: string[] = [
  'Gym',
  'Fisicoculturismo',
  'Powerlifting',
  'CrossFit',
  'Running',
  'Ciclismo',
  'Natación',
  'Fútbol',
  'Baloncesto',
  'Artes marciales',
  'Calistenia',
  'Otro',
];

export const WEEK_DAY_OPTIONS: { value: string; label: string }[] = [
  { value: 'monday', label: 'Lun' },
  { value: 'tuesday', label: 'Mar' },
  { value: 'wednesday', label: 'Mié' },
  { value: 'thursday', label: 'Jue' },
  { value: 'friday', label: 'Vie' },
  { value: 'saturday', label: 'Sáb' },
  { value: 'sunday', label: 'Dom' },
];

export const SESSION_DURATION_OPTIONS: { value: number; label: string }[] = [
  { value: 30, label: '30 minutos' },
  { value: 45, label: '45 minutos' },
  { value: 60, label: '60 minutos' },
  { value: 75, label: '75 minutos' },
  { value: 90, label: '90 minutos' },
  { value: 120, label: 'Más de 90 minutos' },
];

export const EQUIPMENT_OPTIONS: { value: string; label: string }[] = [
  { value: 'full_gym', label: 'Gimnasio completo' },
  { value: 'dumbbells', label: 'Mancuernas' },
  { value: 'olympic_bar', label: 'Barra olímpica' },
  { value: 'weight_plates', label: 'Discos' },
  { value: 'bench', label: 'Banco' },
  { value: 'cables', label: 'Poleas' },
  { value: 'smith_machine', label: 'Máquina Smith' },
  { value: 'resistance_bands', label: 'Bandas elásticas' },
  { value: 'trx', label: 'TRX' },
  { value: 'bodyweight', label: 'Peso corporal' },
  { value: 'other', label: 'Otro' },
];

/**
 * Equipment options shown when training at home or both gym+home.
 * AI Coach: determines exercise substitutions when gym equipment is unavailable.
 */
export const HOME_EQUIPMENT_OPTIONS: { value: string; label: string }[] = [
  { value: 'dumbbells', label: 'Mancuernas' },
  { value: 'barbell', label: 'Barra' },
  { value: 'weight_plates', label: 'Discos' },
  { value: 'bench', label: 'Banco' },
  { value: 'resistance_bands', label: 'Bandas' },
  { value: 'kettlebell', label: 'Kettlebell' },
  { value: 'cable_pulley', label: 'Polea' },
  { value: 'rack', label: 'Rack' },
  { value: 'multi_machine', label: 'Máquina multifunción' },
  { value: 'bodyweight_only', label: 'Peso corporal solamente' },
];

export const TRAINING_LOCATION_OPTIONS: {
  value: TrainingLocation;
  label: string;
}[] = [
  { value: 'gym', label: 'Gimnasio' },
  { value: 'home', label: 'Casa' },
  { value: 'both', label: 'Ambos' },
];

export const TRAINING_STYLE_PREFERENCE_LABELS: Record<
  TrainingStylePreference,
  string
> = {
  short: 'Cortos e intensos',
  medium: 'Moderados',
  long: 'Largos y progresivos',
};

/** Muscle groups selectable as priority or avoid targets. */
export const MUSCLE_GROUP_OPTIONS: { value: string; label: string }[] = [
  { value: 'chest', label: 'Pecho' },
  { value: 'back', label: 'Espalda' },
  { value: 'shoulders', label: 'Hombros' },
  { value: 'arms', label: 'Brazos' },
  { value: 'legs', label: 'Piernas' },
  { value: 'glutes', label: 'Glúteos' },
  { value: 'abs', label: 'Abdomen' },
];

export const INJURY_SEVERITY_LABELS: Record<InjurySeverity, string> = {
  minor: 'Leve',
  moderate: 'Moderada',
  severe: 'Severa',
};

export const DISEASE_SEVERITY_LABELS: Record<DiseaseSeverity, string> = {
  minor: 'Leve',
  moderate: 'Moderada',
  severe: 'Severa',
};

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * Validates the athlete profile form data before saving.
 * Returns an error message string when invalid, or null when valid.
 *
 * Rules:
 *  - At least one available training day must be selected.
 *  - Session duration must be set (> 0).
 *  - A primary goal must be selected.
 */
export function validateAthleteProfileFormData(
  data: AthleteProfileFormData
): string | null {
  if (
    !data.training.availableDays ||
    data.training.availableDays.length === 0
  ) {
    return 'Selecciona al menos un día disponible para entrenar.';
  }
  if (!data.training.sessionDuration || data.training.sessionDuration <= 0) {
    return 'Selecciona la duración de tus sesiones de entrenamiento.';
  }
  if (!data.training.goal) {
    return 'Selecciona tu objetivo principal de entrenamiento.';
  }
  return null;
}
