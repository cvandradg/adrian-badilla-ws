import type { Timestamp } from 'firebase/firestore';
import {
  EQUIPMENT_CATALOG,
  GOAL_CATALOG,
  INJURY_AREA_CATALOG,
  MEAL_SCHEDULE_CATALOG,
  MEDICAL_CONDITION_CATALOG,
  MUSCLE_CATALOG,
  PREFERRED_SCHEDULE_CATALOG,
  SEVERITY_CATALOG,
  SPORT_CATALOG,
  TRAINING_CONSISTENCY_CATALOG,
  TRAINING_EXPERIENCE_CATALOG,
  TRAINING_LOCATION_CATALOG,
  TRAINING_STYLE_PREFERENCE_CATALOG,
  TRAINING_TYPE_CATALOG,
  WEEK_DAY_CATALOG,
  type EquipmentId,
  type GoalId,
  type InjuryAreaId,
  type MealScheduleId,
  type MedicalConditionId,
  type MuscleId,
  type PreferredScheduleId,
  type SeverityId,
  type TrainingConsistencyId,
  type TrainingExperienceId,
  type TrainingLocationId,
  type TrainingStylePreferenceId,
  type TrainingTypeId,
  type WeekDayId,
} from '@adrian-badilla/ai';

// ─── Enums / union literals ────────────────────────────────────────────────────

export type TrainingExperience = TrainingExperienceId;

export type TrainingGoal = GoalId;

export type TrainingConsistency = TrainingConsistencyId;

export type PreferredSchedule = PreferredScheduleId;

/** Where the user trains. Controls equipment selector visibility and AI routine filtering. */
export type TrainingLocation = TrainingLocationId;

/**
 * User's preferred workout style.
 * The AI Coach uses this to structure session volume and rest periods.
 */
export type TrainingStylePreference = TrainingStylePreferenceId;
export type InjuryArea = InjuryAreaId;
export type MedicalConditionType = MedicalConditionId;

/**
 * Severity levels for injuries and diseases.
 * 'severe' triggers a manual-review flag so the AI Coach defers to a human trainer.
 */
export type InjurySeverity = SeverityId;
export type DiseaseSeverity = SeverityId;

export type AlcoholFrequency = 'never' | 'occasionally' | 'frequent';

export type MealSlot = MealScheduleId;

export interface AthleteProfileInjury {
  area?: InjuryArea;
  severity?: InjurySeverity;
  notes: string;
}

export interface AthleteProfileCondition {
  type?: MedicalConditionType;
  name?: string;
  severity?: DiseaseSeverity;
  notes: string;
}

// ─── Sub-documents ────────────────────────────────────────────────────────────

export interface AthleteProfileTraining {
  sport: string;
  trainingExperience: TrainingExperience;
  trainingType: TrainingTypeId;
  goal: TrainingGoal;
  /** Days of the week the user can train. e.g. ['monday', 'wednesday', 'friday'] */
  availableDays: WeekDayId[];
  preferredSchedule: PreferredSchedule;
  /** Training session duration in minutes. */
  sessionDuration: number;
  trainingConsistency: TrainingConsistency;
  /** Available equipment identifiers. e.g. ['full_gym', 'dumbbells'] */
  availableEquipment: EquipmentId[];

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
  priorityMuscles?: MuscleId[];

  /**
   * Muscle groups to exclude or minimize.
   * AI Coach: removes or substitutes exercises targeting these groups.
   * Useful for mild discomfort that doesn't warrant a full injury description.
   */
  avoidMuscles?: MuscleId[];
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
  injuries?: AthleteProfileInjury[];
  conditions?: AthleteProfileCondition[];

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

function toLabelRecord<TKey extends string>(
  catalog: readonly { id: TKey; label: string }[]
): Record<TKey, string> {
  return Object.fromEntries(
    catalog.map((item) => [item.id, item.label])
  ) as Record<TKey, string>;
}

export const TRAINING_EXPERIENCE_LABELS: Record<TrainingExperience, string> =
  toLabelRecord(TRAINING_EXPERIENCE_CATALOG);

export const TRAINING_GOAL_LABELS: Record<TrainingGoal, string> =
  toLabelRecord(GOAL_CATALOG);

export const TRAINING_CONSISTENCY_LABELS: Record<TrainingConsistency, string> =
  toLabelRecord(TRAINING_CONSISTENCY_CATALOG);

export const PREFERRED_SCHEDULE_LABELS: Record<PreferredSchedule, string> =
  toLabelRecord(PREFERRED_SCHEDULE_CATALOG);

export const ALCOHOL_FREQUENCY_LABELS: Record<AlcoholFrequency, string> = {
  never: 'Nunca',
  occasionally: 'Ocasionalmente',
  frequent: 'Frecuente',
};

export const MEAL_SLOT_LABELS: Record<MealSlot, string> = toLabelRecord(
  MEAL_SCHEDULE_CATALOG
);

export const TRAINING_TYPE_OPTIONS: {
  value: TrainingTypeId;
  label: string;
}[] = TRAINING_TYPE_CATALOG.map((item) => ({
  value: item.id,
  label: item.label,
}));

/** Predefined sport options for the sport select. 'other' triggers a free-text input. */
export const SPORT_OPTIONS: { value: string; label: string }[] =
  SPORT_CATALOG.map((item) => ({ value: item.id, label: item.label }));

export const WEEK_DAY_OPTIONS: { value: WeekDayId; label: string }[] =
  WEEK_DAY_CATALOG.map((item) => ({ value: item.id, label: item.label }));

export const SESSION_DURATION_OPTIONS: { value: number; label: string }[] = [
  { value: 30, label: '30 minutos' },
  { value: 45, label: '45 minutos' },
  { value: 60, label: '60 minutos' },
  { value: 75, label: '75 minutos' },
  { value: 90, label: '90 minutos' },
  { value: 120, label: 'Más de 90 minutos' },
];

export const EQUIPMENT_OPTIONS: { value: EquipmentId; label: string }[] =
  EQUIPMENT_CATALOG.map((item) => ({ value: item.id, label: item.label }));

/**
 * Equipment options shown when training at home or both gym+home.
 * AI Coach: determines exercise substitutions when gym equipment is unavailable.
 */
export const HOME_EQUIPMENT_OPTIONS: { value: EquipmentId; label: string }[] =
  EQUIPMENT_CATALOG.filter((item) =>
    [
      'dumbbells',
      'barbell',
      'weight_plates',
      'bench',
      'resistance_bands',
      'kettlebell',
      'cable_pulley',
      'rack',
      'multi_machine',
      'bodyweight_only',
    ].includes(item.id)
  ).map((item) => ({ value: item.id, label: item.label }));

export const TRAINING_LOCATION_OPTIONS: {
  value: TrainingLocation;
  label: string;
}[] = TRAINING_LOCATION_CATALOG.map((item) => ({
  value: item.id,
  label: item.label,
}));

export const TRAINING_STYLE_PREFERENCE_LABELS: Record<
  TrainingStylePreference,
  string
> = toLabelRecord(TRAINING_STYLE_PREFERENCE_CATALOG);

/** Muscle groups selectable as priority or avoid targets. */
export const MUSCLE_GROUP_OPTIONS: { value: MuscleId; label: string }[] =
  MUSCLE_CATALOG.map((item) => ({ value: item.id, label: item.label }));

export const INJURY_SEVERITY_LABELS: Record<InjurySeverity, string> =
  toLabelRecord(SEVERITY_CATALOG);

export const DISEASE_SEVERITY_LABELS: Record<DiseaseSeverity, string> =
  toLabelRecord(SEVERITY_CATALOG);

export const INJURY_AREA_LABELS: Record<InjuryArea, string> = toLabelRecord(
  INJURY_AREA_CATALOG
);

export const MEDICAL_CONDITION_LABELS: Record<MedicalConditionType, string> =
  toLabelRecord(MEDICAL_CONDITION_CATALOG);

export const INJURY_AREA_OPTIONS: {
  value: InjuryArea;
  label: string;
}[] = INJURY_AREA_CATALOG.map((item) => ({
  value: item.id,
  label: item.label,
}));

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
  if ((data.training.priorityMuscles?.length ?? 0) > 3) {
    return 'Selecciona hasta 3 músculos prioritarios para que podamos personalizar mejor tu rutina.';
  }
  return null;
}
