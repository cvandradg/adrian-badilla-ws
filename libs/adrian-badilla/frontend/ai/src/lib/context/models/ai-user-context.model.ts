import type {
  EquipmentId,
  GoalId,
  MealScheduleId,
  MuscleId,
  PreferredScheduleId,
  TrainingConsistencyId,
  TrainingExperienceId,
  TrainingLocationId,
  TrainingStylePreferenceId,
  TrainingTypeId,
  WeekDayId,
} from '../../shared/catalogs/athlete-profile.catalogs';
import type { RawAthleteProfile } from '../mappers/athlete-profile-normalizer';
import type {
  AIHealthRestrictions,
  HealthRestrictions,
} from './health-restrictions.model';

export type { AIHealthRestrictions, HealthRestrictions };

export type AIBmiCategory = 'underweight' | 'normal' | 'overweight' | 'obesity';

export interface AIHealthProfile {
  ageYears: number | null;
  heightCm: number | null;
  weightKg: number | null;
  bodyFatPercent: number | null;
  bmi: number | null;
  bmiCategory: AIBmiCategory | null;
  gender: string | null;
}

export interface AIAthleteProfile {
  goal: GoalId | null;
  secondaryGoal: GoalId | null;
  trainingExperience: TrainingExperienceId | null;
  monthsTraining: number | null;
  trainingLocation: TrainingLocationId | null;
  availableDays: WeekDayId[];
  sessionDuration: number | null;
  availableEquipment: EquipmentId[];
  priorityMuscles: MuscleId[];
  avoidMuscles: MuscleId[];
  trainingType: TrainingTypeId | null;
  trainingStylePreference: TrainingStylePreferenceId | null;
  preferredSchedule: PreferredScheduleId | null;
  trainingConsistency: TrainingConsistencyId | null;
  sport: string | null;
}

export interface AINutritionProfile {
  followsDiet: boolean;
  mealSchedule: MealScheduleId[];
  foodIntolerances: string;
}

export interface AIPreferences {
  preferredWorkoutDays: WeekDayId[];
  preferredSchedule: PreferredScheduleId | null;
  trainingLocation: TrainingLocationId | null;
  availableEquipment: EquipmentId[];
}

export interface AIMetrics {
  bmiScore: number | null;
  bmiCategory: AIBmiCategory | null;
  idealWeightKg: number | null;
  leanBodyMassKg: number | null;
  fatMassKg: number | null;
  calorieEstimate: number | null;
  trainingAgeCategory: TrainingExperienceId | null;
}

export interface AIContextReadiness {
  isHealthProfileComplete: boolean;
  isAthleteProfileComplete: boolean;
  isNutritionProfileComplete: boolean;
  isWorkoutRecommendationReady: boolean;
  isDietRecommendationReady: boolean;
  missingFields: string[];
}

export interface AIUserContext {
  userId: string;
  displayName: string;
  healthProfile: AIHealthProfile;
  athleteProfile: AIAthleteProfile;
  healthRestrictions: HealthRestrictions;
  nutritionProfile: AINutritionProfile;
  preferences: AIPreferences;
  metrics: AIMetrics;
  readiness: AIContextReadiness;
}

export interface AIUserContextSourceHealthProfile {
  ageYears?: number | null;
  heightCm?: number | null;
  weightKg?: number | null;
  bodyFatPercent?: number | null;
  bmi?: number | null;
  bmiCategory?: AIBmiCategory | null;
  gender?: string | null;
  isComplete?: boolean | null;
}

export interface AIUserContextSource {
  uid?: string | null;
  userId?: string | null;
  displayName?: string | null;
  healthProfile?: AIUserContextSourceHealthProfile | null;
  athleteProfile?: RawAthleteProfile | null;
  gender?: string | null;
  ageYears?: number | null;
  heightCm?: number | null;
  weightKg?: number | null;
  bodyFatPercent?: number | null;
}
