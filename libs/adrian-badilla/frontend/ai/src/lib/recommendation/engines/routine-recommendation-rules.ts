import type { AIUserContext } from '../../context/models/ai-user-context.model';
import type {
  RoutineRecommendationCandidate,
  RecommendationGoalId,
} from '../models/routine-recommendation-context.model';
import type {
  RoutineRecommendationPenalty,
  RoutineRecommendationReason,
} from '../models/routine-recommendation-result.model';

export const ROUTINE_RECOMMENDATION_SCORE_RULES = {
  goalMatch: 40,
  equipmentCompatible: 15,
  locationCompatible: 10,
  scheduleCompatible: 10,
  sessionDurationCompatible: 10,
  priorityMusclesWorkedMax: 10,
  contraindications: -50,
  missingEquipment: -30,
  excessiveDuration: -20,
  locationMismatch: -10,
  incompleteRoutineTemplate: -100,
} as const;

export const ROUTINE_RECOMMENDATION_SCORE_RANGE = {
  min:
    ROUTINE_RECOMMENDATION_SCORE_RULES.contraindications +
    ROUTINE_RECOMMENDATION_SCORE_RULES.missingEquipment +
    ROUTINE_RECOMMENDATION_SCORE_RULES.excessiveDuration +
    ROUTINE_RECOMMENDATION_SCORE_RULES.locationMismatch +
    ROUTINE_RECOMMENDATION_SCORE_RULES.incompleteRoutineTemplate,
  max:
    ROUTINE_RECOMMENDATION_SCORE_RULES.goalMatch +
    ROUTINE_RECOMMENDATION_SCORE_RULES.equipmentCompatible +
    ROUTINE_RECOMMENDATION_SCORE_RULES.locationCompatible +
    ROUTINE_RECOMMENDATION_SCORE_RULES.scheduleCompatible +
    ROUTINE_RECOMMENDATION_SCORE_RULES.sessionDurationCompatible +
    ROUTINE_RECOMMENDATION_SCORE_RULES.priorityMusclesWorkedMax,
} as const;

export interface RoutineRecommendationRuleEvaluation {
  score: number;
  reasons: RoutineRecommendationReason[];
  penalties: RoutineRecommendationPenalty[];
  requiredAdaptations: string[];
}

export interface HealthRestrictionEvaluation {
  warnings: string[];
  penalties: RoutineRecommendationPenalty[];
  requiredAdaptations: string[];
}

export function calculatePriorityMuscleCoverage(
  userContext: AIUserContext,
  candidate: RoutineRecommendationCandidate
): {
  workedCount: number;
  totalCount: number;
  coverage: number;
  bonus: number;
} {
  const totalCount = userContext.athleteProfile.priorityMuscles.length;

  if (totalCount === 0) {
    return {
      workedCount: 0,
      totalCount: 0,
      coverage: 0,
      bonus: 0,
    };
  }

  const workedCount = candidate.priorityMusclesWorked.length;
  const coverage = workedCount / totalCount;

  return {
    workedCount,
    totalCount,
    coverage,
    bonus: Math.round(
      coverage * ROUTINE_RECOMMENDATION_SCORE_RULES.priorityMusclesWorkedMax
    ),
  };
}

function mapUserGoalToRoutineGoal(
  goal: AIUserContext['athleteProfile']['goal']
): RecommendationGoalId | null {
  switch (goal) {
    case 'muscle_gain':
      return 'muscle_gain';
    case 'fat_loss':
      return 'fat_loss';
    case 'sports_performance':
      return 'athletic_performance';
    case 'body_recomposition':
    case 'maintain_weight':
      return 'general_fitness';
    default:
      return null;
  }
}

export function isGoalMatch(
  userContext: AIUserContext,
  candidate: RoutineRecommendationCandidate
): boolean {
  const mappedGoal = mapUserGoalToRoutineGoal(userContext.athleteProfile.goal);
  return (
    mappedGoal != null && candidate.routineTemplate.goals.includes(mappedGoal)
  );
}

export function isScheduleMatch(
  userContext: AIUserContext,
  candidate: RoutineRecommendationCandidate
): boolean {
  const availableDays = userContext.athleteProfile.availableDays.length;

  if (availableDays === 0) {
    return true;
  }

  return candidate.estimatedWeeklyDays <= availableDays;
}

export function isSessionDurationMatch(
  userContext: AIUserContext,
  candidate: RoutineRecommendationCandidate
): boolean {
  const preferredDuration = userContext.athleteProfile.sessionDuration;

  if (preferredDuration == null) {
    return true;
  }

  return candidate.estimatedSessionDuration <= preferredDuration;
}

export function isExcessiveDuration(
  userContext: AIUserContext,
  candidate: RoutineRecommendationCandidate
): boolean {
  const preferredDuration = userContext.athleteProfile.sessionDuration;

  if (preferredDuration == null) {
    return false;
  }

  return candidate.estimatedSessionDuration > preferredDuration + 15;
}

export function evaluateRoutineRecommendationCandidate(
  userContext: AIUserContext,
  candidate: RoutineRecommendationCandidate
): RoutineRecommendationRuleEvaluation {
  const reasons: RoutineRecommendationReason[] = [];
  const penalties: RoutineRecommendationPenalty[] = [];
  const requiredAdaptations = new Set<string>();

  if (isGoalMatch(userContext, candidate)) {
    reasons.push({
      code: 'goal_match',
      label: 'Goal matches user objective',
      points: ROUTINE_RECOMMENDATION_SCORE_RULES.goalMatch,
    });
  }

  if (candidate.compatibleWithEquipment) {
    reasons.push({
      code: 'equipment_compatible',
      label: 'Required equipment is available',
      points: ROUTINE_RECOMMENDATION_SCORE_RULES.equipmentCompatible,
    });
  } else {
    penalties.push({
      code: 'missing_equipment',
      label: 'Required equipment is missing',
      points: ROUTINE_RECOMMENDATION_SCORE_RULES.missingEquipment,
    });
    requiredAdaptations.add('equipment_substitutions');
  }

  if (candidate.compatibleWithLocation) {
    reasons.push({
      code: 'location_compatible',
      label: 'Training location is compatible',
      points: ROUTINE_RECOMMENDATION_SCORE_RULES.locationCompatible,
    });
  } else {
    penalties.push({
      code: 'location_mismatch',
      label: 'Training location does not match the user context',
      points: ROUTINE_RECOMMENDATION_SCORE_RULES.locationMismatch,
    });
  }

  if (isScheduleMatch(userContext, candidate)) {
    reasons.push({
      code: 'schedule_compatible',
      label: 'Weekly schedule fits available training days',
      points: ROUTINE_RECOMMENDATION_SCORE_RULES.scheduleCompatible,
    });
  }

  if (isSessionDurationMatch(userContext, candidate)) {
    reasons.push({
      code: 'session_duration_compatible',
      label: 'Session duration fits the user preference',
      points: ROUTINE_RECOMMENDATION_SCORE_RULES.sessionDurationCompatible,
    });
  }

  const priorityMuscleCoverage = calculatePriorityMuscleCoverage(
    userContext,
    candidate
  );

  if (priorityMuscleCoverage.bonus > 0) {
    reasons.push({
      code: 'priority_muscles_worked',
      label: `Priority muscles coverage ${priorityMuscleCoverage.workedCount}/${priorityMuscleCoverage.totalCount} (${Math.round(priorityMuscleCoverage.coverage * 100)}%). Bonus +${priorityMuscleCoverage.bonus}.`,
      points: priorityMuscleCoverage.bonus,
    });
  }

  if (candidate.isIncompleteTemplate) {
    penalties.push({
      code: 'incomplete_routine_template',
      label:
        'Routine template is incomplete: it has no usable days or resolved exercises',
      points: ROUTINE_RECOMMENDATION_SCORE_RULES.incompleteRoutineTemplate,
    });
    requiredAdaptations.add('routine_template_incomplete');
  }

  if (candidate.contraindicatedExercises.length > 0) {
    penalties.push({
      code: 'contraindications',
      label: 'Routine includes contraindicated exercises',
      points: ROUTINE_RECOMMENDATION_SCORE_RULES.contraindications,
    });
    requiredAdaptations.add('exercise_substitutions');
  }

  if (isExcessiveDuration(userContext, candidate)) {
    penalties.push({
      code: 'excessive_duration',
      label: 'Session duration exceeds preference by more than 15 minutes',
      points: ROUTINE_RECOMMENDATION_SCORE_RULES.excessiveDuration,
    });
    requiredAdaptations.add('volume_reduction');
  }

  const healthRestrictionEvaluation = evaluateHealthRestrictions(
    userContext,
    candidate
  );

  for (const penalty of healthRestrictionEvaluation.penalties) {
    penalties.push(penalty);
  }

  for (const adaptation of healthRestrictionEvaluation.requiredAdaptations) {
    requiredAdaptations.add(adaptation);
  }

  return {
    score:
      reasons.reduce((sum, item) => sum + item.points, 0) +
      penalties.reduce((sum, item) => sum + item.points, 0),
    reasons,
    penalties,
    requiredAdaptations: [...requiredAdaptations],
  };
}

export function evaluateHealthRestrictions(
  _userContext: AIUserContext,
  _candidate: RoutineRecommendationCandidate
): HealthRestrictionEvaluation {
  // TODO: Adapt routines for structured injuries without parsing free text.
  // TODO: Adapt routines for structured medical conditions.
  // TODO: Reduce score when structured restrictions require lower training risk.
  // TODO: Emit health warnings from structured restrictions when appropriate.
  return {
    warnings: [],
    penalties: [],
    requiredAdaptations: [],
  };
}

export function detectRestrictedMovementPatterns(
  _userContext: AIUserContext,
  _candidate: RoutineRecommendationCandidate
): string[] {
  // TODO: Detect movement-pattern restrictions from canonical injury/condition IDs.
  return [];
}

export function applyHealthRestrictions(
  result: RoutineRecommendationRuleEvaluation,
  _healthRestrictionEvaluation: HealthRestrictionEvaluation
): RoutineRecommendationRuleEvaluation {
  // TODO: Substitute exercises and add required adaptations from structured restrictions.
  return result;
}

export function normalizeRoutineRecommendationScore(score: number): number {
  const range =
    ROUTINE_RECOMMENDATION_SCORE_RANGE.max -
    ROUTINE_RECOMMENDATION_SCORE_RANGE.min;
  const normalized =
    ((score - ROUTINE_RECOMMENDATION_SCORE_RANGE.min) / range) * 100;

  return Math.max(0, Math.min(100, Math.round(normalized * 10) / 10));
}
