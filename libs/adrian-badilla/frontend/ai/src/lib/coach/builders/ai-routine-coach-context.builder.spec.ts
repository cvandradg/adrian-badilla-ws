import { AIRoutineCoachContextBuilder } from './ai-routine-coach-context.builder';
import {
  createAIUserContext,
  createExercise,
  createRoutineTemplate,
} from '../../recommendation/testing/routine-recommendation.fixtures';
import { RoutineRecommendationContextBuilder } from '../../recommendation/builders/routine-recommendation-context.builder';
import { RoutineRecommendationEngine } from '../../recommendation/engines/routine-recommendation.engine';

describe('AIRoutineCoachContextBuilder', () => {
  it('builds a coach context with routine diagnostics and user fields', () => {
    const userContext = createAIUserContext();
    const recommendation = new RoutineRecommendationEngine().run(
      new RoutineRecommendationContextBuilder().build(
        userContext,
        [createRoutineTemplate()],
        [createExercise()]
      )
    )[0];

    const context = new AIRoutineCoachContextBuilder().build({
      userContext,
      recommendedRoutine: recommendation,
    });

    expect(context.user.userId).toBe('uid');
    expect(context.recommendedRoutine.routineId).toBe('routine-1');
    expect(context.trainingLocation).toBe('gym');
    expect(context.availableEquipment).toContain('full_gym');
    expect(context.priorityMuscles).toEqual(['chest', 'back']);
    expect(context.scoreBreakdown.length).toBeGreaterThan(0);
    expect(context.availableExerciseAlternatives).toEqual([]);
  });

  it('includes available exercise alternatives when exerciseLibrary is provided', () => {
    const userContext = createAIUserContext({
      athleteProfile: {
        ...createAIUserContext().athleteProfile,
        trainingLocation: 'home',
        availableEquipment: ['dumbbells', 'bodyweight'],
      },
    });
    const recommendation = new RoutineRecommendationEngine().run(
      new RoutineRecommendationContextBuilder().build(
        userContext,
        [
          createRoutineTemplate({
            trainingLocations: ['home'],
            days: [
              {
                dayId: 'day-1',
                name: 'Day 1',
                order: 0,
                exercises: [
                  {
                    exId: 'slot-1',
                    exerciseId: 'exercise-used',
                    order: 0,
                    sets: 4,
                    repsMin: 8,
                    repsMax: 10,
                    restSeconds: 90,
                    tempo: '2-0-2-0',
                    rir: 2,
                    notes: '',
                  },
                ],
              },
            ],
          }),
        ],
        [
          createExercise({
            id: 'exercise-used',
            primaryMuscles: ['glutes'],
            secondaryMuscles: ['hamstrings'],
            trainingLocations: ['home'],
            requiredEquipment: ['barbell'],
          }),
        ]
      )
    )[0];

    const context = new AIRoutineCoachContextBuilder().build({
      userContext,
      recommendedRoutine: recommendation,
      exerciseLibrary: [
        createExercise({
          id: 'exercise-alt',
          name: 'Goblet Squat',
          primaryMuscles: ['glutes'],
          secondaryMuscles: ['hamstrings'],
          trainingLocations: ['home'],
          requiredEquipment: ['dumbbells'],
        }),
      ],
    });

    expect(context.availableExerciseAlternatives).toEqual([
      expect.objectContaining({
        exerciseId: 'exercise-alt',
      }),
    ]);
  });
});
