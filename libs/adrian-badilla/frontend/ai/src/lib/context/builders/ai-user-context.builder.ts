import {
  calculateBmi,
  calculateBmiCategory,
  calculateBmiScore,
  calculateCalorieEstimate,
  calculateFatMass,
  calculateIdealWeight,
  calculateLeanBodyMass,
  calculateTrainingAgeCategory,
} from '../calculators/ai-metrics.calculators';
import { normalizeAthleteProfile } from '../mappers/athlete-profile-normalizer';
import type {
  AIAthleteProfile,
  AIContextReadiness,
  AIHealthProfile,
  AIHealthRestrictions,
  AINutritionProfile,
  AIPreferences,
  AIUserContext,
  AIUserContextSource,
} from '../models/ai-user-context.model';
import {
  isAthleteProfileComplete,
  isDietRecommendationReady,
  isHealthProfileComplete,
  isNutritionProfileComplete,
  isWorkoutRecommendationReady,
} from '../validators/ai-context-readiness.validators';

function cleanString(value: string | null | undefined): string {
  return value?.trim() ?? '';
}

function normalizeNumber(value: number | null | undefined): number | null {
  return typeof value === 'number' && !Number.isNaN(value) ? value : null;
}

function buildMissingFields(
  healthProfile: AIHealthProfile,
  athleteProfile: AIAthleteProfile,
  nutritionProfile: AINutritionProfile
): string[] {
  const missing = new Set<string>();

  if (healthProfile.ageYears == null) missing.add('healthProfile.ageYears');
  if (healthProfile.heightCm == null) missing.add('healthProfile.heightCm');
  if (healthProfile.weightKg == null) missing.add('healthProfile.weightKg');
  if (athleteProfile.goal == null) missing.add('athleteProfile.goal');
  if (athleteProfile.trainingExperience == null) {
    missing.add('athleteProfile.trainingExperience');
  }
  if (athleteProfile.trainingLocation == null) {
    missing.add('athleteProfile.trainingLocation');
  }
  if (athleteProfile.trainingType == null) {
    missing.add('athleteProfile.trainingType');
  }
  if (athleteProfile.availableDays.length === 0) {
    missing.add('athleteProfile.availableDays');
  }
  if (nutritionProfile.mealSchedule.length === 0) {
    missing.add('nutritionProfile.mealSchedule');
  }

  return [...missing];
}

export class AIUserContextBuilder {
  build(user: AIUserContextSource): AIUserContext {
    const healthSource = user.healthProfile ?? {};
    const ageYears = normalizeNumber(healthSource.ageYears ?? user.ageYears);
    const heightCm = normalizeNumber(healthSource.heightCm ?? user.heightCm);
    const weightKg = normalizeNumber(healthSource.weightKg ?? user.weightKg);
    const bodyFatPercent = normalizeNumber(
      healthSource.bodyFatPercent ?? user.bodyFatPercent
    );
    const bmi =
      normalizeNumber(healthSource.bmi) ?? calculateBmi(weightKg, heightCm);
    const bmiCategory = healthSource.bmiCategory ?? calculateBmiCategory(bmi);

    const healthProfile: AIHealthProfile = {
      ageYears,
      heightCm,
      weightKg,
      bodyFatPercent,
      bmi,
      bmiCategory,
      gender: cleanString(healthSource.gender ?? user.gender) || null,
    };

    const normalizedAthleteProfile = normalizeAthleteProfile(
      user.athleteProfile
    );

    const athleteProfile: AIAthleteProfile = {
      goal: normalizedAthleteProfile?.training.goal ?? null,
      secondaryGoal: normalizedAthleteProfile?.training.secondaryGoal ?? null,
      trainingExperience:
        normalizedAthleteProfile?.training.trainingExperience ?? null,
      monthsTraining: normalizedAthleteProfile?.training.monthsTraining ?? null,
      trainingLocation:
        normalizedAthleteProfile?.training.trainingLocation ?? null,
      availableDays: normalizedAthleteProfile?.training.availableDays ?? [],
      sessionDuration:
        normalizedAthleteProfile?.training.sessionDuration ?? null,
      availableEquipment:
        normalizedAthleteProfile?.training.availableEquipment ?? [],
      priorityMuscles: normalizedAthleteProfile?.training.priorityMuscles ?? [],
      avoidMuscles: normalizedAthleteProfile?.training.avoidMuscles ?? [],
      trainingType: normalizedAthleteProfile?.training.trainingType ?? null,
      trainingStylePreference:
        normalizedAthleteProfile?.training.trainingStylePreference ?? null,
      preferredSchedule:
        normalizedAthleteProfile?.training.preferredSchedule ?? null,
      trainingConsistency:
        normalizedAthleteProfile?.training.trainingConsistency ?? null,
      sport: normalizedAthleteProfile?.training.sport || null,
    };

    const healthRestrictions: AIHealthRestrictions = {
      hasDisease: normalizedAthleteProfile?.health.hasDisease ?? false,
      diseaseDescription:
        normalizedAthleteProfile?.health.diseaseDescription ?? '',
      diseaseSeverity: normalizedAthleteProfile?.health.diseaseSeverity ?? null,
      medicalConditions:
        normalizedAthleteProfile?.health.conditions?.map((condition) => ({
          conditionId: condition.type ?? 'other',
          name: condition.name,
          severityId: condition.severity ?? null,
          notes: condition.notes,
        })) ?? [],
      hasInjury: normalizedAthleteProfile?.health.hasInjury ?? false,
      injuryDescription:
        normalizedAthleteProfile?.health.injuryDescription ?? '',
      injurySeverity: normalizedAthleteProfile?.health.injurySeverity ?? null,
      injuries:
        normalizedAthleteProfile?.health.injuries?.map((injury) => ({
          areaId: injury.area ?? 'lower_back',
          severityId: injury.severity ?? null,
          notes: injury.notes,
        })) ?? [],
    };

    const nutritionProfile: AINutritionProfile = {
      followsDiet: normalizedAthleteProfile?.nutrition.followsDiet ?? false,
      mealSchedule: normalizedAthleteProfile?.nutrition.mealSchedule ?? [],
      foodIntolerances:
        normalizedAthleteProfile?.nutrition.foodIntolerances ?? '',
    };

    const preferences: AIPreferences = {
      preferredWorkoutDays: athleteProfile.availableDays,
      preferredSchedule: athleteProfile.preferredSchedule,
      trainingLocation: athleteProfile.trainingLocation,
      availableEquipment: athleteProfile.availableEquipment,
    };

    const leanBodyMassKg = calculateLeanBodyMass(weightKg, bodyFatPercent);
    const fatMassKg = calculateFatMass(weightKg, bodyFatPercent);

    const metrics = {
      bmiScore: calculateBmiScore(bmi),
      bmiCategory,
      idealWeightKg: calculateIdealWeight(heightCm),
      leanBodyMassKg,
      fatMassKg,
      calorieEstimate: calculateCalorieEstimate(
        weightKg,
        athleteProfile.trainingConsistency,
        leanBodyMassKg
      ),
      trainingAgeCategory: calculateTrainingAgeCategory(
        athleteProfile.monthsTraining,
        athleteProfile.trainingExperience
      ),
    };

    const readiness: AIContextReadiness = {
      isHealthProfileComplete: isHealthProfileComplete(healthProfile),
      isAthleteProfileComplete: isAthleteProfileComplete(athleteProfile),
      isNutritionProfileComplete: isNutritionProfileComplete(nutritionProfile),
      isWorkoutRecommendationReady: isWorkoutRecommendationReady(
        healthProfile,
        athleteProfile,
        healthRestrictions
      ),
      isDietRecommendationReady: isDietRecommendationReady(
        healthProfile,
        nutritionProfile,
        healthRestrictions
      ),
      missingFields: buildMissingFields(
        healthProfile,
        athleteProfile,
        nutritionProfile
      ),
    };

    return {
      userId: cleanString(user.uid ?? user.userId),
      displayName: cleanString(user.displayName),
      healthProfile,
      athleteProfile,
      healthRestrictions,
      nutritionProfile,
      preferences,
      metrics,
      readiness,
    };
  }
}
