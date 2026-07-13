import type {
  AIAthleteProfile,
  AIHealthProfile,
  AIHealthRestrictions,
  AINutritionProfile,
} from '../models/ai-user-context.model';

export function isHealthProfileComplete(profile: AIHealthProfile): boolean {
  return (
    profile.ageYears != null &&
    profile.heightCm != null &&
    profile.weightKg != null &&
    profile.bmi != null &&
    profile.bmiCategory != null
  );
}

export function isAthleteProfileComplete(profile: AIAthleteProfile): boolean {
  return Boolean(
    profile.goal &&
      profile.trainingExperience &&
      profile.trainingLocation &&
      profile.trainingType &&
      profile.trainingStylePreference &&
      profile.preferredSchedule &&
      profile.trainingConsistency &&
      profile.availableDays.length > 0 &&
      profile.sessionDuration != null
  );
}

export function isNutritionProfileComplete(
  profile: AINutritionProfile
): boolean {
  return profile.mealSchedule.length > 0;
}

export function isWorkoutRecommendationReady(
  healthProfile: AIHealthProfile,
  athleteProfile: AIAthleteProfile,
  restrictions: AIHealthRestrictions
): boolean {
  return (
    isHealthProfileComplete(healthProfile) &&
    isAthleteProfileComplete(athleteProfile) &&
    restrictions.diseaseSeverity !== 'severe' &&
    restrictions.injurySeverity !== 'severe'
  );
}

export function isDietRecommendationReady(
  healthProfile: AIHealthProfile,
  nutritionProfile: AINutritionProfile,
  restrictions: AIHealthRestrictions
): boolean {
  return (
    isHealthProfileComplete(healthProfile) &&
    isNutritionProfileComplete(nutritionProfile) &&
    restrictions.diseaseSeverity !== 'severe'
  );
}
