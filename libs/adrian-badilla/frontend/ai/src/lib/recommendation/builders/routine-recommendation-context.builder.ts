import type { Exercise } from '@admin/exercise-library';
import type { RoutineTemplate } from '@admin/routine-builder';
import type { AIUserContext } from '../../context/models/ai-user-context.model';
import {
  calculateMatchedEquipment,
  calculateMissingEquipment,
  calculatePriorityMuscles,
  calculateRequiredEquipment,
  calculateSessionDuration,
  calculateWeeklyDays,
  calculateWorkedMusclesByRole,
  detectContraindications,
  generateWarnings,
  isIncompleteRoutineTemplate,
  isCompatibleWithLocation,
  isCompatibleWithSchedule,
  resolveExercises,
  resolveRecommendationGoal,
  resolveRecommendationLocation,
} from '../helpers/routine-recommendation.helpers';
import type {
  RoutineRecommendationCandidate,
  RoutineRecommendationContext,
} from '../models/routine-recommendation-context.model';

export class RoutineRecommendationContextBuilder {
  build(
    userContext: AIUserContext,
    routineTemplates: RoutineTemplate[],
    exercises: Exercise[]
  ): RoutineRecommendationContext {
    const candidates = routineTemplates.map((routineTemplate) =>
      this.buildCandidate(userContext, routineTemplate, exercises)
    );

    return {
      userContext,
      candidates,
    };
  }

  private buildCandidate(
    userContext: AIUserContext,
    routineTemplate: RoutineTemplate,
    exercises: Exercise[]
  ): RoutineRecommendationCandidate {
    const totalExercises = routineTemplate.days.reduce(
      (sum, day) => sum + day.exercises.length,
      0
    );
    const { resolvedExercises, missingExercises } = resolveExercises(
      routineTemplate,
      exercises
    );
    const isIncompleteTemplate = isIncompleteRoutineTemplate({
      routineTemplate,
      resolvedExercises,
      totalExercises,
    });
    const requiredEquipment = calculateRequiredEquipment(resolvedExercises);
    const matchedEquipment = calculateMatchedEquipment(
      userContext,
      requiredEquipment
    );
    const missingEquipment = calculateMissingEquipment(
      requiredEquipment,
      matchedEquipment
    );
    const {
      primaryWorkedMuscles,
      secondaryWorkedMuscles,
      stabilizerWorkedMuscles,
      musclesWorked,
    } = calculateWorkedMusclesByRole(resolvedExercises);
    const priorityMusclesWorked = calculatePriorityMuscles(
      userContext,
      primaryWorkedMuscles
    );
    const estimatedSessionDuration = calculateSessionDuration(routineTemplate);
    const estimatedWeeklyDays = calculateWeeklyDays(routineTemplate);
    const contraindicatedExercises = detectContraindications(
      userContext,
      resolvedExercises
    );
    const trainingLocation = resolveRecommendationLocation(
      routineTemplate,
      userContext
    );
    const compatibleWithLocation = isCompatibleWithLocation(
      userContext,
      trainingLocation
    );
    const compatibleWithSchedule = isCompatibleWithSchedule(
      userContext,
      estimatedWeeklyDays,
      estimatedSessionDuration
    );
    const warnings = generateWarnings({
      missingExercises,
      missingEquipment,
      contraindicatedExercises,
      compatibleWithSchedule,
      estimatedSessionDuration,
      isIncompleteTemplate,
      userContext,
    });

    return {
      id: routineTemplate.id,
      routineTemplate,
      isIncompleteTemplate,
      resolvedExercises,
      missingExercises,
      estimatedSessionDuration,
      estimatedWeeklyDays,
      goal: resolveRecommendationGoal(routineTemplate, userContext),
      trainingLocation,
      requiredEquipment,
      matchedEquipment,
      missingEquipment,
      primaryWorkedMuscles,
      secondaryWorkedMuscles,
      stabilizerWorkedMuscles,
      musclesWorked,
      priorityMusclesWorked,
      contraindicatedExercises,
      compatibleWithEquipment: missingEquipment.length === 0,
      compatibleWithLocation,
      compatibleWithSchedule,
      warnings,
      metadata: {
        totalExercises,
        resolvedExerciseCount: resolvedExercises.length,
        missingExerciseCount: missingExercises.length,
        contraindicationCount: contraindicatedExercises.length,
        locationMatched: compatibleWithLocation,
        equipmentMatchedCount: matchedEquipment.length,
        missingEquipmentCount: missingEquipment.length,
        userGoalMatched:
          resolveRecommendationGoal(routineTemplate, userContext) != null,
      },
    };
  }
}
