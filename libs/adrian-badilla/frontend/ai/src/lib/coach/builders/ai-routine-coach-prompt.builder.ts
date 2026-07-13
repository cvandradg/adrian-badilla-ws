import type { AIRoutineCoachContext } from '../models/ai-routine-coach-context.model';

function formatList(values: readonly string[]): string {
  return values.length > 0 ? values.join(', ') : 'none';
}

export class AIRoutineCoachPromptBuilder {
  build(context: AIRoutineCoachContext): string {
    const recommendedRoutine = context.recommendedRoutine;
    const candidate = recommendedRoutine.candidate;

    return [
      'You are an AI routine coach.',
      'Return only valid JSON matching the AIRoutineCoachResponse schema.',
      '',
      'USER',
      `- userId: ${context.user.userId}`,
      `- displayName: ${context.user.displayName}`,
      `- age: ${context.age ?? 'unknown'}`,
      `- sex: ${context.sex ?? 'unknown'}`,
      `- currentWeightKg: ${context.currentWeight ?? 'unknown'}`,
      `- heightCm: ${context.height ?? 'unknown'}`,
      `- experience: ${context.experience ?? 'unknown'}`,
      '',
      'TRAINING PROFILE',
      `- trainingLocation: ${context.trainingLocation ?? 'unknown'}`,
      `- availableDays: ${formatList(context.availableDays)}`,
      `- preferredSessionDurationMinutes: ${context.preferredSessionDuration ?? 'unknown'}`,
      `- availableEquipment: ${formatList(context.availableEquipment)}`,
      `- priorityMuscles: ${formatList(context.priorityMuscles)}`,
      `- secondaryGoal: ${context.secondaryGoal ?? 'none'}`,
      '',
      'NUTRITION PROFILE',
      `- followsDiet: ${String(context.nutritionProfile.followsDiet)}`,
      `- mealSchedule: ${formatList(context.nutritionProfile.mealSchedule)}`,
      `- foodIntolerances: ${context.nutritionProfile.foodIntolerances || 'none'}`,
      '',
      'HEALTH',
      `- hasInjury: ${String(context.health.healthRestrictions.hasInjury)}`,
      `- hasDisease: ${String(context.health.healthRestrictions.hasDisease)}`,
      `- injuryDescription: ${context.health.healthRestrictions.injuryDescription || 'none'}`,
      `- diseaseDescription: ${context.health.healthRestrictions.diseaseDescription || 'none'}`,
      '',
      'RECOMMENDED ROUTINE',
      `- routineId: ${recommendedRoutine.routineId}`,
      `- routineName: ${recommendedRoutine.routineTemplate.name}`,
      `- score: ${recommendedRoutine.score}`,
      `- normalizedScore: ${recommendedRoutine.normalizedScore}`,
      `- warnings: ${formatList(recommendedRoutine.warnings)}`,
      `- recommendationReasons: ${formatList(recommendedRoutine.reasons.map((item) => `${item.code}:${item.points}`))}`,
      `- penalties: ${formatList(recommendedRoutine.penalties.map((item) => `${item.code}:${item.points}`))}`,
      '',
      'ROUTINE DIAGNOSTICS',
      `- estimatedWeeklyDays: ${candidate.estimatedWeeklyDays}`,
      `- estimatedSessionDuration: ${candidate.estimatedSessionDuration}`,
      `- routineTemplateComplete: ${String(!candidate.isIncompleteTemplate)}`,
      `- routineTemplateStatus: ${candidate.isIncompleteTemplate ? 'Routine template is incomplete' : 'Routine template is complete'}`,
      `- primaryWorkedMuscles: ${formatList(candidate.primaryWorkedMuscles)}`,
      `- secondaryWorkedMuscles: ${formatList(candidate.secondaryWorkedMuscles)}`,
      `- stabilizerWorkedMuscles: ${formatList(candidate.stabilizerWorkedMuscles)}`,
      `- musclesWorked: ${formatList(candidate.musclesWorked)}`,
      `- priorityMusclesWorked: ${formatList(candidate.priorityMusclesWorked)}`,
      '',
      'AVAILABLE EXERCISE ALTERNATIVES',
      ...(context.availableExerciseAlternatives.length > 0
        ? context.availableExerciseAlternatives.map(
            (item) =>
              `- exerciseId: ${item.exerciseId} | name: ${item.name} | primaryMuscles: ${formatList(item.primaryMuscles)} | requiredEquipment: ${formatList(item.requiredEquipment)} | trainingLocations: ${formatList(item.trainingLocations)} | reason: ${item.reason} | matchReasons: ${formatList(item.matchReasons)}`
          )
        : ['- none']),
      '',
      'SCORE BREAKDOWN',
      ...context.scoreBreakdown.map(
        (item) => `- ${item.type}:${item.code}:${item.points}:${item.label}`
      ),
      '',
      'TASK',
      'Only suggest replacementExerciseId values from AVAILABLE EXERCISE ALTERNATIVES. Do not invent exercise IDs.',
      'Summarize why this routine fits or does not fit the athlete, suggest safe adaptations, identify warnings, and keep recommendations grounded in the provided context only.',
    ].join('\n');
  }
}
