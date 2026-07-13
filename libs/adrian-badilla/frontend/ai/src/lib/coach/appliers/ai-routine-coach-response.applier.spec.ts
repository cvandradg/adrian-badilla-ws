import { AIRoutineCoachResponseApplier } from './ai-routine-coach-response.applier';
import {
  createAIUserContext,
  createExercise,
  createRoutineTemplate,
} from '../../recommendation/testing/routine-recommendation.fixtures';
import { RoutineRecommendationContextBuilder } from '../../recommendation/builders/routine-recommendation-context.builder';
import { RoutineRecommendationEngine } from '../../recommendation/engines/routine-recommendation.engine';

describe('AIRoutineCoachResponseApplier', () => {
  const applier = new AIRoutineCoachResponseApplier();

  function buildRecommendation() {
    const userContext = createAIUserContext();
    const recommendation = new RoutineRecommendationEngine().run(
      new RoutineRecommendationContextBuilder().build(
        userContext,
        [createRoutineTemplate()],
        [createExercise()]
      )
    )[0];

    return {
      ...recommendation,
      availableExerciseAlternatives: [
        {
          exerciseId: 'exercise-alt',
          name: 'Push Up',
          primaryMuscles: ['chest'],
          secondaryMuscles: ['triceps'],
          bodyRegion: 'upper_body',
          movementPattern: 'push',
          goals: ['muscle_gain'],
          requiredEquipment: ['bodyweight'],
          trainingLocations: ['home', 'gym'],
          reason: 'same_primary_muscle_match',
          matchReasons: [
            'compatible_equipment',
            'compatible_location',
            'same_primary_muscle',
          ],
        },
      ],
    };
  }

  function buildEmptyResponse() {
    return {
      summary: '',
      adaptations: [],
      warnings: [],
      coachNotes: [],
      confidence: 0,
      exerciseChanges: [],
      volumeChanges: [],
      equipmentChanges: [],
      reviewRequired: false,
    } as const;
  }

  it('returns an unchanged copy for an empty response', () => {
    const recommendation = buildRecommendation();

    const result = applier.apply(recommendation, buildEmptyResponse());

    expect(result.originalRecommendation).toBe(recommendation);
    expect(result.adaptedRoutineTemplate).toEqual(recommendation.routineTemplate);
    expect(result.adaptedRoutineTemplate).not.toBe(recommendation.routineTemplate);
    expect(result.appliedExerciseChanges).toEqual([]);
    expect(result.appliedVolumeChanges).toEqual([]);
    expect(result.rejectedChanges).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(result.reviewRequired).toBe(false);
  });

  it('applies a valid replace by changing only exerciseId', () => {
    const recommendation = buildRecommendation();
    const originalSlot = recommendation.routineTemplate.days[0].exercises[0];

    const result = applier.apply(recommendation, {
      ...buildEmptyResponse(),
      exerciseChanges: [
        {
          action: 'replace',
          exerciseId: 'exercise-1',
          replacementExerciseId: 'exercise-alt',
          reason: 'No barbell available',
        },
      ],
    });

    const adaptedSlot = result.adaptedRoutineTemplate.days[0].exercises[0];

    expect(adaptedSlot.exerciseId).toBe('exercise-alt');
    expect(adaptedSlot.exId).toBe(originalSlot.exId);
    expect(adaptedSlot.order).toBe(originalSlot.order);
  });

  it('replace preserves series, reps, descanso, tempo y orden', () => {
    const recommendation = buildRecommendation();
    const originalSlot = recommendation.routineTemplate.days[0].exercises[0];

    const result = applier.apply(recommendation, {
      ...buildEmptyResponse(),
      exerciseChanges: [
        {
          action: 'replace',
          exerciseId: 'exercise-1',
          replacementExerciseId: 'exercise-alt',
          reason: 'No barbell available',
        },
      ],
    });

    const adaptedSlot = result.adaptedRoutineTemplate.days[0].exercises[0];

    expect(adaptedSlot.sets).toBe(originalSlot.sets);
    expect(adaptedSlot.repsMin).toBe(originalSlot.repsMin);
    expect(adaptedSlot.repsMax).toBe(originalSlot.repsMax);
    expect(adaptedSlot.restSeconds).toBe(originalSlot.restSeconds);
    expect(adaptedSlot.tempo).toBe(originalSlot.tempo);
    expect(adaptedSlot.rir).toBe(originalSlot.rir);
    expect(adaptedSlot.notes).toBe(originalSlot.notes);
  });

  it('rejects a replace with an invented ID', () => {
    const recommendation = buildRecommendation();

    const result = applier.apply(recommendation, {
      ...buildEmptyResponse(),
      exerciseChanges: [
        {
          action: 'replace',
          exerciseId: 'exercise-1',
          replacementExerciseId: 'invented-id',
          reason: 'Invalid replacement',
        },
      ],
    });

    expect(result.rejectedChanges).toEqual([
      expect.objectContaining({
        changeType: 'exercise',
        targetId: 'exercise-1',
        reason: 'replacement_exercise_id_not_available',
      }),
    ]);
    expect(result.reviewRequired).toBe(true);
  });

  it('rejects a replace when the replacement is not in available alternatives', () => {
    const recommendation = {
      ...buildRecommendation(),
      availableExerciseAlternatives: [],
    };

    const result = applier.apply(recommendation, {
      ...buildEmptyResponse(),
      exerciseChanges: [
        {
          action: 'replace',
          exerciseId: 'exercise-1',
          replacementExerciseId: 'exercise-alt',
          reason: 'Unavailable replacement',
        },
      ],
    });

    expect(result.rejectedChanges).toEqual([
      expect.objectContaining({
        reason: 'replacement_exercise_id_not_available',
      }),
    ]);
  });

  it('does not mutate the original template on replace', () => {
    const recommendation = buildRecommendation();
    const originalExerciseId =
      recommendation.routineTemplate.days[0].exercises[0].exerciseId;

    applier.apply(recommendation, {
      ...buildEmptyResponse(),
      exerciseChanges: [
        {
          action: 'replace',
          exerciseId: 'exercise-1',
          replacementExerciseId: 'exercise-alt',
          reason: 'No barbell available',
        },
      ],
    });

    expect(recommendation.routineTemplate.days[0].exercises[0].exerciseId).toBe(
      originalExerciseId
    );
  });

  it('decrease sets never goes below 1', () => {
    const recommendation = buildRecommendation();

    const result = applier.apply(recommendation, {
      ...buildEmptyResponse(),
      volumeChanges: [
        {
          target: 'exercise',
          targetId: 'exercise-1',
          action: 'decrease',
          setsDelta: 10,
          repsDelta: 0,
          reason: 'Reduce sets',
        },
      ],
    });

    expect(result.adaptedRoutineTemplate.days[0].exercises[0].sets).toBe(1);
  });

  it('repsMax never ends below repsMin', () => {
    const recommendation = buildRecommendation();

    const result = applier.apply(recommendation, {
      ...buildEmptyResponse(),
      volumeChanges: [
        {
          target: 'exercise',
          targetId: 'exercise-1',
          action: 'decrease',
          setsDelta: 0,
          repsDelta: 20,
          reason: 'Reduce reps',
        },
      ],
    });

    const slot = result.adaptedRoutineTemplate.days[0].exercises[0];
    expect(slot.repsMin).toBeGreaterThanOrEqual(1);
    expect(slot.repsMax).toBeGreaterThanOrEqual(slot.repsMin);
  });

  it('rejects a missing volume targetId', () => {
    const recommendation = buildRecommendation();

    const result = applier.apply(recommendation, {
      ...buildEmptyResponse(),
      volumeChanges: [
        {
          target: 'exercise',
          targetId: 'missing-exercise',
          action: 'decrease',
          setsDelta: 1,
          repsDelta: 1,
          reason: 'Missing target',
        },
      ],
    });

    expect(result.rejectedChanges).toEqual([
      expect.objectContaining({
        changeType: 'volume',
        targetId: 'missing-exercise',
        reason: 'volume_target_not_found',
      }),
    ]);
  });

  it('remove requires review', () => {
    const recommendation = buildRecommendation();

    const result = applier.apply(recommendation, {
      ...buildEmptyResponse(),
      exerciseChanges: [
        {
          action: 'remove',
          exerciseId: 'exercise-1',
          reason: 'Shoulder pain',
        },
      ],
    });

    expect(result.warnings).toContain('exercise_removal_requires_review');
    expect(result.reviewRequired).toBe(true);
  });

  it('add is not supported and requires review', () => {
    const recommendation = buildRecommendation();

    const result = applier.apply(recommendation, {
      ...buildEmptyResponse(),
      exerciseChanges: [
        {
          action: 'add',
          exerciseId: 'exercise-1',
          replacementExerciseId: 'exercise-alt',
          reason: 'Add accessory',
        },
      ],
    });

    expect(result.warnings).toContain('exercise_addition_not_supported');
    expect(result.reviewRequired).toBe(true);
  });

  it('equipment changes do not modify the routine directly', () => {
    const recommendation = buildRecommendation();

    const result = applier.apply(recommendation, {
      ...buildEmptyResponse(),
      equipmentChanges: [
        {
          action: 'replace',
          equipmentId: 'barbell',
          replacementEquipmentId: 'dumbbells',
          reason: 'No barbell',
        },
      ],
    });

    expect(result.adaptedRoutineTemplate).toEqual(recommendation.routineTemplate);
    expect(result.warnings).toContain(
      'equipment_change_requires_exercise_substitution'
    );
  });

  it('applies multiple valid changes in stable order', () => {
    const recommendation = buildRecommendation();

    const result = applier.apply(recommendation, {
      ...buildEmptyResponse(),
      exerciseChanges: [
        {
          action: 'keep',
          exerciseId: 'exercise-1',
          reason: 'Keep baseline',
        },
        {
          action: 'replace',
          exerciseId: 'exercise-1',
          replacementExerciseId: 'exercise-alt',
          reason: 'Swap equipment',
        },
      ],
      volumeChanges: [
        {
          target: 'exercise',
          targetId: 'exercise-alt',
          action: 'increase',
          setsDelta: 1,
          repsDelta: 2,
          reason: 'Progression',
        },
      ],
    });

    expect(result.appliedExerciseChanges.map((item) => item.action)).toEqual([
      'keep',
      'replace',
    ]);
    expect(result.appliedVolumeChanges).toEqual([
      expect.objectContaining({
        action: 'increase',
        targetId: 'exercise-alt',
      }),
    ]);
    expect(result.adaptedRoutineTemplate.days[0].exercises[0].exerciseId).toBe(
      'exercise-alt'
    );
  });
});
