import type { RoutineRecommendationResult } from '../../recommendation/models/routine-recommendation-result.model';
import type { AIHealthRestrictions } from '../../context/models/ai-user-context.model';
import { findAvailableExerciseAlternatives } from '../helpers/available-exercise-alternatives.helper';
import type {
  AIRoutineCoachContext,
  AIRoutineCoachContextBuildInput,
  AIRoutineCoachScoreBreakdownItem,
} from '../models/ai-routine-coach-context.model';

function buildScoreBreakdown(
  recommendedRoutine: RoutineRecommendationResult
): AIRoutineCoachScoreBreakdownItem[] {
  return [
    ...recommendedRoutine.reasons.map((reason) => ({
      type: 'reason' as const,
      code: reason.code,
      label: reason.label,
      points: reason.points,
    })),
    ...recommendedRoutine.penalties.map((penalty) => ({
      type: 'penalty' as const,
      code: penalty.code,
      label: penalty.label,
      points: penalty.points,
    })),
    ...recommendedRoutine.warnings.map((warning) => ({
      type: 'warning' as const,
      code: warning,
      label: warning,
      points: 0,
    })),
    ...recommendedRoutine.requiredAdaptations.map((adaptation) => ({
      type: 'adaptation' as const,
      code: adaptation,
      label: adaptation,
      points: 0,
    })),
  ];
}

function normalizeHealthRestrictions(
  healthRestrictions: AIRoutineCoachContextBuildInput['userContext']['healthRestrictions']
): AIHealthRestrictions {
  return {
    hasDisease: healthRestrictions.hasDisease ?? false,
    diseaseDescription: healthRestrictions.diseaseDescription ?? '',
    diseaseSeverity: healthRestrictions.diseaseSeverity ?? null,
    hasInjury: healthRestrictions.hasInjury ?? false,
    injuryDescription: healthRestrictions.injuryDescription ?? '',
    injurySeverity: healthRestrictions.injurySeverity ?? null,
    injuries: healthRestrictions.injuries ?? [],
    medicalConditions: healthRestrictions.medicalConditions ?? [],
    restrictedMovementPatternIds:
      healthRestrictions.restrictedMovementPatternIds ?? [],
  };
}

export class AIRoutineCoachContextBuilder {
  build(input: AIRoutineCoachContextBuildInput): AIRoutineCoachContext {
    const { userContext, recommendedRoutine, exerciseLibrary } = input;
    return {
      user: {
        userId: userContext.userId,
        displayName: userContext.displayName,
      },
      athleteProfile: userContext.athleteProfile,
      nutritionProfile: userContext.nutritionProfile,
      health: {
        healthProfile: userContext.healthProfile,
        healthRestrictions: normalizeHealthRestrictions(
          userContext.healthRestrictions
        ),
      },
      recommendedRoutine,
      scoreBreakdown: buildScoreBreakdown(recommendedRoutine),
      recommendationReasons: recommendedRoutine.reasons,
      penalties: recommendedRoutine.penalties,
      warnings: recommendedRoutine.warnings,
      availableExerciseAlternatives: findAvailableExerciseAlternatives({
        userAvailableEquipment: userContext.athleteProfile.availableEquipment,
        userTrainingLocation: userContext.athleteProfile.trainingLocation,
        userPriorityMuscles: userContext.athleteProfile.priorityMuscles,
        missingEquipment: recommendedRoutine.candidate.missingEquipment,
        resolvedExercises: recommendedRoutine.candidate.resolvedExercises,
        exerciseLibrary,
      }),
      availableEquipment: userContext.athleteProfile.availableEquipment,
      trainingLocation: userContext.athleteProfile.trainingLocation,
      availableDays: userContext.athleteProfile.availableDays,
      priorityMuscles: userContext.athleteProfile.priorityMuscles,
      secondaryGoal: userContext.athleteProfile.secondaryGoal,
      currentWeight: userContext.healthProfile.weightKg,
      height: userContext.healthProfile.heightCm,
      age: userContext.healthProfile.ageYears,
      sex: userContext.healthProfile.gender,
      experience: userContext.athleteProfile.trainingExperience,
      preferredSessionDuration: userContext.athleteProfile.sessionDuration,
    };
  }
}
