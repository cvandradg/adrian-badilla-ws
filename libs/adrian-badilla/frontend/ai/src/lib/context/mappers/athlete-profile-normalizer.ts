import {
  EQUIPMENT_CATALOG,
  GOAL_CATALOG,
  MEAL_SCHEDULE_CATALOG,
  MEDICAL_CONDITION_CATALOG,
  MUSCLE_CATALOG,
  PREFERRED_SCHEDULE_CATALOG,
  SEVERITY_CATALOG,
  SPORT_CATALOG,
  TRAINING_CONSISTENCY_CATALOG,
  TRAINING_EXPERIENCE_CATALOG,
  INJURY_AREA_CATALOG,
  TRAINING_LOCATION_CATALOG,
  TRAINING_STYLE_PREFERENCE_CATALOG,
  TRAINING_TYPE_CATALOG,
  WEEK_DAY_CATALOG,
  type CanonicalCatalogItem,
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
} from '../../shared/catalogs/athlete-profile.catalogs';

export interface RawAthleteProfileTraining {
  sport?: string | null;
  trainingExperience?: string | null;
  trainingType?: string | null;
  goal?: string | null;
  availableDays?: string[] | null;
  preferredSchedule?: string | null;
  sessionDuration?: number | null;
  trainingConsistency?: string | null;
  availableEquipment?: string[] | null;
  trainingLocation?: string | null;
  trainingStylePreference?: string | null;
  monthsTraining?: number | null;
  secondaryGoal?: string | null;
  priorityMuscles?: string[] | null;
  avoidMuscles?: string[] | null;
}

export interface RawAthleteProfileNutrition {
  followsDiet?: boolean | null;
  mealSchedule?: string[] | null;
  foodIntolerances?: string | null;
}

export interface RawAthleteProfileHealth {
  hasDisease?: boolean | null;
  diseaseDescription?: string | null;
  hasInjury?: boolean | null;
  injuryDescription?: string | null;
  injurySeverity?: string | null;
  diseaseSeverity?: string | null;
  injuries?: RawAthleteProfileInjury[] | null;
  conditions?: RawAthleteProfileCondition[] | null;
}

export interface RawAthleteProfileInjury {
  area?: string | null;
  severity?: string | null;
  notes?: string | null;
}

export interface RawAthleteProfileCondition {
  type?: string | null;
  name?: string | null;
  severity?: string | null;
  notes?: string | null;
}

export interface RawAthleteProfileLifestyle {
  profession?: string | null;
  smoker?: boolean | null;
  alcohol?: string | null;
}

export interface RawAthleteProfileFormData {
  training?: RawAthleteProfileTraining | null;
  nutrition?: RawAthleteProfileNutrition | null;
  health?: RawAthleteProfileHealth | null;
  lifestyle?: RawAthleteProfileLifestyle | null;
}

export interface RawAthleteProfile extends RawAthleteProfileFormData {
  completed?: boolean | null;
  completedAt?: unknown;
  updatedAt?: unknown;
}

export interface NormalizedAthleteProfileTraining {
  sport: string;
  trainingExperience: TrainingExperienceId;
  trainingType: TrainingTypeId;
  goal: GoalId;
  availableDays: WeekDayId[];
  preferredSchedule: PreferredScheduleId;
  sessionDuration: number;
  trainingConsistency: TrainingConsistencyId;
  availableEquipment: EquipmentId[];
  trainingLocation: TrainingLocationId;
  trainingStylePreference: TrainingStylePreferenceId;
  monthsTraining?: number;
  secondaryGoal?: GoalId;
  priorityMuscles?: MuscleId[];
  avoidMuscles?: MuscleId[];
}

export interface NormalizedAthleteProfileNutrition {
  followsDiet: boolean;
  mealSchedule: MealScheduleId[];
  foodIntolerances: string;
}

export interface NormalizedAthleteProfileHealth {
  hasDisease: boolean;
  diseaseDescription: string;
  hasInjury: boolean;
  injuryDescription: string;
  injurySeverity?: SeverityId;
  diseaseSeverity?: SeverityId;
  injuries?: NormalizedAthleteProfileInjury[];
  conditions?: NormalizedAthleteProfileCondition[];
}

export interface NormalizedAthleteProfileInjury {
  area?: InjuryAreaId;
  severity?: SeverityId;
  notes: string;
}

export interface NormalizedAthleteProfileCondition {
  type?: MedicalConditionId;
  name?: string;
  severity?: SeverityId;
  notes: string;
}

export interface NormalizedAthleteProfileLifestyle {
  profession: string;
  smoker: boolean;
  alcohol: string;
}

export interface NormalizedAthleteProfileFormData {
  training: NormalizedAthleteProfileTraining;
  nutrition: NormalizedAthleteProfileNutrition;
  health: NormalizedAthleteProfileHealth;
  lifestyle: NormalizedAthleteProfileLifestyle;
}

export interface NormalizedAthleteProfile
  extends NormalizedAthleteProfileFormData {
  completed: boolean;
  completedAt: unknown;
  updatedAt: unknown;
}

function foldText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/[^a-z0-9\s/]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function slugifyCanonicalId(value: string): string {
  const folded = foldText(value).replace(/\//g, ' ');
  return folded ? folded.replace(/\s+/g, '_') : 'other';
}

function buildAliasMap<TId extends string>(
  catalog: readonly CanonicalCatalogItem<TId>[]
): Map<string, TId> {
  const map = new Map<string, TId>();

  for (const item of catalog) {
    map.set(foldText(item.id), item.id);
    map.set(foldText(item.label), item.id);
    for (const alias of item.aliases ?? []) {
      map.set(foldText(alias), item.id);
    }
  }

  return map;
}

const goalAliasMap = buildAliasMap(GOAL_CATALOG);
const trainingTypeAliasMap = buildAliasMap(TRAINING_TYPE_CATALOG);
const sportAliasMap = buildAliasMap(SPORT_CATALOG);
const equipmentAliasMap = buildAliasMap(EQUIPMENT_CATALOG);
const trainingExperienceAliasMap = buildAliasMap(TRAINING_EXPERIENCE_CATALOG);
const trainingLocationAliasMap = buildAliasMap(TRAINING_LOCATION_CATALOG);
const preferredScheduleAliasMap = buildAliasMap(PREFERRED_SCHEDULE_CATALOG);
const trainingConsistencyAliasMap = buildAliasMap(TRAINING_CONSISTENCY_CATALOG);
const trainingStyleAliasMap = buildAliasMap(TRAINING_STYLE_PREFERENCE_CATALOG);
const mealScheduleAliasMap = buildAliasMap(MEAL_SCHEDULE_CATALOG);
const severityAliasMap = buildAliasMap(SEVERITY_CATALOG);
const injuryAreaAliasMap = buildAliasMap(INJURY_AREA_CATALOG);
const medicalConditionAliasMap = buildAliasMap(MEDICAL_CONDITION_CATALOG);
const weekDayAliasMap = buildAliasMap(WEEK_DAY_CATALOG);
const muscleAliasMap = buildAliasMap(MUSCLE_CATALOG);

function normalizeCatalogValue<TId extends string>(
  value: string | null | undefined,
  aliasMap: Map<string, TId>,
  fallback: TId
): TId {
  if (!value) return fallback;

  return aliasMap.get(foldText(value)) ?? fallback;
}

function normalizeOptionalCatalogValue<TId extends string>(
  value: string | null | undefined,
  aliasMap: Map<string, TId>
): TId | undefined {
  if (!value) return undefined;

  return aliasMap.get(foldText(value));
}

function normalizeStringArray<TId extends string>(
  values: string[] | null | undefined,
  normalizeItem: (value: string) => TId | TId[] | undefined
): TId[] {
  const normalized = new Set<TId>();

  for (const value of values ?? []) {
    const next = normalizeItem(value);

    if (!next) continue;

    if (Array.isArray(next)) {
      for (const item of next) normalized.add(item);
      continue;
    }

    normalized.add(next);
  }

  return [...normalized];
}

export function normalizeGoal(value: string | null | undefined): GoalId {
  return normalizeCatalogValue(value, goalAliasMap, 'maintain_weight');
}

export function normalizeTrainingType(
  value: string | null | undefined
): TrainingTypeId {
  return normalizeCatalogValue(value, trainingTypeAliasMap, 'other');
}

export function normalizeSport(value: string | null | undefined): string {
  if (!value) return '';

  return sportAliasMap.get(foldText(value)) ?? slugifyCanonicalId(value);
}

export function normalizeTrainingExperience(
  value: string | null | undefined
): TrainingExperienceId {
  return normalizeCatalogValue(value, trainingExperienceAliasMap, 'beginner');
}

export function normalizeTrainingLocation(
  value: string | null | undefined
): TrainingLocationId {
  return normalizeCatalogValue(value, trainingLocationAliasMap, 'gym');
}

export function normalizePreferredSchedule(
  value: string | null | undefined
): PreferredScheduleId {
  if (value && foldText(value) === 'midday') {
    return 'afternoon';
  }

  return normalizeCatalogValue(value, preferredScheduleAliasMap, 'morning');
}

export function normalizeTrainingConsistency(
  value: string | null | undefined
): TrainingConsistencyId {
  return normalizeCatalogValue(value, trainingConsistencyAliasMap, 'medium');
}

export function normalizeTrainingStylePreference(
  value: string | null | undefined
): TrainingStylePreferenceId {
  return normalizeCatalogValue(value, trainingStyleAliasMap, 'balanced');
}

export function normalizeMealScheduleItem(
  value: string | null | undefined
): MealScheduleId | undefined {
  return normalizeOptionalCatalogValue(value, mealScheduleAliasMap);
}

export function normalizeSeverity(
  value: string | null | undefined
): SeverityId | undefined {
  return normalizeOptionalCatalogValue(value, severityAliasMap);
}

export function normalizeInjuryArea(
  value: string | null | undefined
): InjuryAreaId | undefined {
  return normalizeOptionalCatalogValue(value, injuryAreaAliasMap);
}

export function normalizeMedicalCondition(
  value: string | null | undefined
): MedicalConditionId | undefined {
  return normalizeOptionalCatalogValue(value, medicalConditionAliasMap);
}

export function normalizeWeekDay(
  value: string | null | undefined
): WeekDayId | undefined {
  return normalizeOptionalCatalogValue(value, weekDayAliasMap);
}

export function normalizeEquipment(
  value: string | null | undefined
): EquipmentId | undefined {
  if (!value) return undefined;

  return (
    equipmentAliasMap.get(foldText(value)) ??
    (slugifyCanonicalId(value) as EquipmentId)
  );
}

export function normalizeMuscle(
  value: string | null | undefined
): MuscleId | MuscleId[] | undefined {
  if (!value) return undefined;

  const folded = foldText(value);

  if (folded === 'arms' || folded === 'brazos') {
    return ['biceps', 'triceps'];
  }

  if (folded === 'legs' || folded === 'piernas') {
    return ['quadriceps', 'hamstrings', 'glutes', 'calves'];
  }

  return muscleAliasMap.get(folded);
}

function normalizeSessionDuration(value: number | null | undefined): number {
  return typeof value === 'number' && value > 0 ? value : 60;
}

function normalizeMonthsTraining(
  value: number | null | undefined
): number | undefined {
  if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
    return undefined;
  }

  return value;
}

function normalizeHealthNotes(value: string | null | undefined): string {
  return value?.trim() ?? '';
}

function normalizeInjuries(
  health: RawAthleteProfileHealth | null | undefined
): NormalizedAthleteProfileInjury[] {
  const normalized = (health?.injuries ?? [])
    .map((item) => {
      const area = normalizeInjuryArea(item?.area);
      const severity = normalizeSeverity(item?.severity);
      const notes = normalizeHealthNotes(item?.notes);

      if (!area && !severity && !notes) {
        return null;
      }

      return {
        ...(area ? { area } : {}),
        ...(severity ? { severity } : {}),
        notes,
      };
    })
    .filter((item): item is NormalizedAthleteProfileInjury => item != null);

  if (normalized.length > 0) {
    return normalized;
  }

  if (!health?.hasInjury) {
    return [];
  }

  const legacySeverity = normalizeSeverity(health.injurySeverity);
  const legacyNotes = normalizeHealthNotes(health.injuryDescription);

  if (!legacySeverity && !legacyNotes) {
    return [];
  }

  return [
    {
      ...(legacySeverity ? { severity: legacySeverity } : {}),
      notes: legacyNotes,
    },
  ];
}

function normalizeConditions(
  health: RawAthleteProfileHealth | null | undefined
): NormalizedAthleteProfileCondition[] {
  const normalized = (health?.conditions ?? [])
    .map((item) => {
      const type = normalizeMedicalCondition(item?.type);
      const name = normalizeHealthNotes(item?.name);
      const severity = normalizeSeverity(item?.severity);
      const notes = normalizeHealthNotes(item?.notes);

      if (!type && !name && !severity && !notes) {
        return null;
      }

      return {
        ...(type ? { type } : {}),
        ...(name ? { name } : {}),
        ...(severity ? { severity } : {}),
        notes,
      };
    })
    .filter((item): item is NormalizedAthleteProfileCondition => item != null);

  if (normalized.length > 0) {
    return normalized;
  }

  if (!health?.hasDisease) {
    return [];
  }

  const legacySeverity = normalizeSeverity(health.diseaseSeverity);
  const legacyNotes = normalizeHealthNotes(health.diseaseDescription);

  if (!legacySeverity && !legacyNotes) {
    return [];
  }

  return [
    {
      type: 'other',
      ...(legacyNotes ? { name: legacyNotes } : {}),
      ...(legacySeverity ? { severity: legacySeverity } : {}),
      notes: '',
    },
  ];
}

export function normalizeAthleteProfileFormData(
  profile: RawAthleteProfileFormData
): NormalizedAthleteProfileFormData {
  const training = profile.training ?? {};
  const normalizedConditions = normalizeConditions(profile.health);
  const normalizedInjuries = normalizeInjuries(profile.health);
  const normalizedLegacyInjurySeverity = normalizeSeverity(
    profile.health?.injurySeverity
  );
  const normalizedLegacyDiseaseSeverity = normalizeSeverity(
    profile.health?.diseaseSeverity
  );
  const normalizedLegacyInjuryDescription =
    profile.health?.injuryDescription?.trim() ?? '';
  const normalizedLegacyDiseaseDescription =
    profile.health?.diseaseDescription?.trim() ?? '';
  const primaryInjury = normalizedInjuries[0];
  const primaryCondition = normalizedConditions[0];
  const normalizedLocation = normalizeTrainingLocation(
    training.trainingLocation
  );
  const normalizedEquipment = normalizeStringArray(
    training.availableEquipment,
    normalizeEquipment
  );
  const availableEquipment: EquipmentId[] =
    normalizedLocation === 'gym'
      ? ['full_gym']
      : normalizedLocation === 'hybrid'
      ? Array.from(new Set<EquipmentId>(['full_gym', ...normalizedEquipment]))
      : normalizedEquipment.filter((item) => item !== 'full_gym');

  return {
    training: {
      sport: normalizeSport(training.sport),
      trainingExperience: normalizeTrainingExperience(
        training.trainingExperience
      ),
      trainingType: normalizeTrainingType(training.trainingType),
      goal: normalizeGoal(training.goal),
      availableDays: normalizeStringArray(
        training.availableDays,
        normalizeWeekDay
      ),
      preferredSchedule: normalizePreferredSchedule(training.preferredSchedule),
      sessionDuration: normalizeSessionDuration(training.sessionDuration),
      trainingConsistency: normalizeTrainingConsistency(
        training.trainingConsistency
      ),
      availableEquipment,
      trainingLocation: normalizedLocation,
      trainingStylePreference: normalizeTrainingStylePreference(
        training.trainingStylePreference
      ),
      ...(normalizeMonthsTraining(training.monthsTraining) != null
        ? { monthsTraining: normalizeMonthsTraining(training.monthsTraining) }
        : {}),
      ...(training.secondaryGoal
        ? { secondaryGoal: normalizeGoal(training.secondaryGoal) }
        : {}),
      priorityMuscles: normalizeStringArray(
        training.priorityMuscles,
        normalizeMuscle
      ).slice(0, 3),
      avoidMuscles: normalizeStringArray(
        training.avoidMuscles,
        normalizeMuscle
      ),
    },
    nutrition: {
      followsDiet: !!profile.nutrition?.followsDiet,
      mealSchedule: normalizeStringArray(
        profile.nutrition?.mealSchedule,
        normalizeMealScheduleItem
      ),
      foodIntolerances: profile.nutrition?.foodIntolerances?.trim() ?? '',
    },
    health: {
      hasDisease: !!profile.health?.hasDisease,
      diseaseDescription:
        normalizedLegacyDiseaseDescription || primaryCondition?.name || '',
      hasInjury: !!profile.health?.hasInjury,
      injuryDescription:
        normalizedLegacyInjuryDescription || primaryInjury?.notes || '',
      conditions: normalizedConditions,
      injuries: normalizedInjuries,
      ...(normalizedLegacyInjurySeverity || primaryInjury?.severity
        ? {
            injurySeverity:
              normalizedLegacyInjurySeverity ?? primaryInjury?.severity,
          }
        : {}),
      ...(normalizedLegacyDiseaseSeverity || primaryCondition?.severity
        ? {
            diseaseSeverity:
              normalizedLegacyDiseaseSeverity ?? primaryCondition?.severity,
          }
        : {}),
    },
    lifestyle: {
      profession: profile.lifestyle?.profession?.trim() ?? '',
      smoker: !!profile.lifestyle?.smoker,
      alcohol: profile.lifestyle?.alcohol?.trim() ?? 'never',
    },
  };
}

export function normalizeAthleteProfile(
  profile: RawAthleteProfile | null | undefined
): NormalizedAthleteProfile | null {
  if (!profile) return null;

  return {
    ...normalizeAthleteProfileFormData(profile),
    completed: !!profile.completed,
    completedAt: profile.completedAt ?? null,
    updatedAt: profile.updatedAt ?? null,
  };
}
