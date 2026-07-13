import type { RoutineExercise, RoutineTemplate } from '@admin/routine-builder';
import type { AIAvailableExerciseAlternative } from '../models/ai-routine-coach-context.model';
import type {
  AIRoutineCoachEquipmentChange,
  AIRoutineCoachExerciseChange,
  AIRoutineCoachResponse,
  AIRoutineCoachVolumeChange,
} from '../models/ai-routine-coach-response.model';
import type { RoutineRecommendationResult } from '../../recommendation/models/routine-recommendation-result.model';

type CoachRecommendationInput = RoutineRecommendationResult & {
  availableExerciseAlternatives?: AIAvailableExerciseAlternative[];
};

export interface AIRoutineCoachAppliedExerciseChange {
  action: 'keep' | 'replace';
  exerciseId: string;
  replacementExerciseId?: string;
  reason: string;
}

export interface AIRoutineCoachAppliedVolumeChange {
  target: 'exercise';
  targetId: string;
  action: 'keep' | 'increase' | 'decrease';
  setsDeltaApplied: number;
  repsDeltaApplied: number;
  reason: string;
}

export interface AIRoutineCoachRejectedChange {
  changeType: 'exercise' | 'volume' | 'equipment';
  targetId: string;
  action: string;
  reason: string;
}

export interface AIRoutineCoachAppliedResult {
  originalRecommendation: RoutineRecommendationResult;
  adaptedRoutineTemplate: RoutineTemplate;
  appliedExerciseChanges: AIRoutineCoachAppliedExerciseChange[];
  appliedVolumeChanges: AIRoutineCoachAppliedVolumeChange[];
  rejectedChanges: AIRoutineCoachRejectedChange[];
  warnings: string[];
  reviewRequired: boolean;
}

function cloneRoutineTemplate(template: RoutineTemplate): RoutineTemplate {
  return {
    ...template,
    days: template.days.map((day) => ({
      ...day,
      exercises: day.exercises.map((exercise) => ({ ...exercise })),
    })),
  };
}

function getAvailableAlternatives(
  recommendation: CoachRecommendationInput
): AIAvailableExerciseAlternative[] {
  return recommendation.availableExerciseAlternatives ?? [];
}

function findSlotByExerciseId(
  template: RoutineTemplate,
  exerciseId: string
): RoutineExercise | null {
  for (const day of template.days) {
    const slot = day.exercises.find((item) => item.exerciseId === exerciseId);

    if (slot) {
      return slot;
    }
  }

  return null;
}

function isValidFiniteInteger(value: number | undefined): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    Number.isInteger(value)
  );
}

function shouldRequireReview(
  response: AIRoutineCoachResponse,
  rejectedChanges: AIRoutineCoachRejectedChange[],
  warnings: string[]
): boolean {
  return (
    response.reviewRequired ||
    rejectedChanges.length > 0 ||
    response.exerciseChanges.some(
      (item) => item.action === 'remove' || item.action === 'add'
    ) ||
    response.warnings.length > 0 ||
    warnings.some(
      (warning) =>
        warning === 'exercise_removal_requires_review' ||
        warning === 'exercise_addition_not_supported' ||
        warning === 'equipment_change_requires_exercise_substitution'
    )
  );
}

export class AIRoutineCoachResponseApplier {
  apply(
    recommendation: RoutineRecommendationResult,
    response: AIRoutineCoachResponse
  ): AIRoutineCoachAppliedResult {
    const adaptedRoutineTemplate = cloneRoutineTemplate(
      recommendation.routineTemplate
    );
    const availableAlternatives = getAvailableAlternatives(
      recommendation as CoachRecommendationInput
    );
    const availableAlternativeIds = new Set(
      availableAlternatives.map((item) => item.exerciseId)
    );
    const warnings = [...response.warnings];
    const rejectedChanges: AIRoutineCoachRejectedChange[] = [];
    const appliedExerciseChanges: AIRoutineCoachAppliedExerciseChange[] = [];
    const appliedVolumeChanges: AIRoutineCoachAppliedVolumeChange[] = [];

    for (const change of response.exerciseChanges) {
      const slot = findSlotByExerciseId(adaptedRoutineTemplate, change.exerciseId);

      if (change.action === 'keep') {
        if (!slot) {
          rejectedChanges.push({
            changeType: 'exercise',
            targetId: change.exerciseId,
            action: change.action,
            reason: 'exercise_id_not_found_in_routine',
          });
          continue;
        }

        appliedExerciseChanges.push({
          action: 'keep',
          exerciseId: change.exerciseId,
          reason: change.reason,
        });
        continue;
      }

      if (change.action === 'remove') {
        warnings.push('exercise_removal_requires_review');
        rejectedChanges.push({
          changeType: 'exercise',
          targetId: change.exerciseId,
          action: change.action,
          reason: 'exercise_removal_requires_review',
        });
        continue;
      }

      if (change.action === 'add') {
        warnings.push('exercise_addition_not_supported');
        rejectedChanges.push({
          changeType: 'exercise',
          targetId: change.exerciseId,
          action: change.action,
          reason: 'exercise_addition_not_supported',
        });
        continue;
      }

      if (!slot) {
        rejectedChanges.push({
          changeType: 'exercise',
          targetId: change.exerciseId,
          action: change.action,
          reason: 'exercise_id_not_found_in_routine',
        });
        continue;
      }

      const replacementExerciseId = change.replacementExerciseId?.trim();

      if (!replacementExerciseId) {
        rejectedChanges.push({
          changeType: 'exercise',
          targetId: change.exerciseId,
          action: change.action,
          reason: 'replacement_exercise_id_required',
        });
        continue;
      }

      if (replacementExerciseId === change.exerciseId) {
        rejectedChanges.push({
          changeType: 'exercise',
          targetId: change.exerciseId,
          action: change.action,
          reason: 'replacement_exercise_id_must_be_different',
        });
        continue;
      }

      if (!availableAlternativeIds.has(replacementExerciseId)) {
        rejectedChanges.push({
          changeType: 'exercise',
          targetId: change.exerciseId,
          action: change.action,
          reason: 'replacement_exercise_id_not_available',
        });
        continue;
      }

      slot.exerciseId = replacementExerciseId;
      appliedExerciseChanges.push({
        action: 'replace',
        exerciseId: change.exerciseId,
        replacementExerciseId,
        reason: change.reason,
      });
    }

    for (const change of response.volumeChanges) {
      if (change.target !== 'exercise') {
        rejectedChanges.push({
          changeType: 'volume',
          targetId: change.targetId,
          action: change.action,
          reason: 'volume_target_not_supported',
        });
        continue;
      }

      const slot = findSlotByExerciseId(adaptedRoutineTemplate, change.targetId);

      if (!slot) {
        rejectedChanges.push({
          changeType: 'volume',
          targetId: change.targetId,
          action: change.action,
          reason: 'volume_target_not_found',
        });
        continue;
      }

      if (change.action === 'keep') {
        appliedVolumeChanges.push({
          target: 'exercise',
          targetId: change.targetId,
          action: 'keep',
          setsDeltaApplied: 0,
          repsDeltaApplied: 0,
          reason: change.reason,
        });
        continue;
      }

      if (
        !isValidFiniteInteger(change.setsDelta) ||
        !isValidFiniteInteger(change.repsDelta)
      ) {
        rejectedChanges.push({
          changeType: 'volume',
          targetId: change.targetId,
          action: change.action,
          reason: 'volume_delta_must_be_finite_integer',
        });
        continue;
      }

      const setsDirection = change.action === 'decrease' ? -1 : 1;
      const repsDirection = change.action === 'decrease' ? -1 : 1;
      const nextSets = Math.max(1, slot.sets + change.setsDelta * setsDirection);
      const nextRepsMin = Math.max(
        1,
        slot.repsMin + change.repsDelta * repsDirection
      );
      const nextRepsMax = Math.max(
        nextRepsMin,
        slot.repsMax + change.repsDelta * repsDirection
      );

      const setsDeltaApplied = nextSets - slot.sets;
      const repsDeltaApplied = nextRepsMin - slot.repsMin;

      slot.sets = nextSets;
      slot.repsMin = nextRepsMin;
      slot.repsMax = nextRepsMax;

      appliedVolumeChanges.push({
        target: 'exercise',
        targetId: change.targetId,
        action: change.action,
        setsDeltaApplied,
        repsDeltaApplied,
        reason: change.reason,
      });
    }

    for (const change of response.equipmentChanges) {
      if (change.action === 'replace' || change.action === 'remove') {
        warnings.push('equipment_change_requires_exercise_substitution');
        rejectedChanges.push({
          changeType: 'equipment',
          targetId: change.equipmentId,
          action: change.action,
          reason: 'equipment_change_requires_exercise_substitution',
        });
      }
    }

    return {
      originalRecommendation: recommendation,
      adaptedRoutineTemplate,
      appliedExerciseChanges,
      appliedVolumeChanges,
      rejectedChanges,
      warnings,
      reviewRequired: shouldRequireReview(response, rejectedChanges, warnings),
    };
  }
}
