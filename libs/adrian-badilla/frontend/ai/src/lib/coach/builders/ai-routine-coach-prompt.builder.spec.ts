import { AIRoutineCoachContextBuilder } from './ai-routine-coach-context.builder';
import { AIRoutineCoachPromptBuilder } from './ai-routine-coach-prompt.builder';
import {
  createAIUserContext,
  createExercise,
  createRoutineTemplate,
} from '../../recommendation/testing/routine-recommendation.fixtures';
import { RoutineRecommendationContextBuilder } from '../../recommendation/builders/routine-recommendation-context.builder';
import { RoutineRecommendationEngine } from '../../recommendation/engines/routine-recommendation.engine';

describe('AIRoutineCoachPromptBuilder', () => {
  it('generates a prompt from the coach context', () => {
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

    const prompt = new AIRoutineCoachPromptBuilder().build(context);

    expect(prompt).toContain('You are an AI routine coach.');
    expect(prompt).toContain('routineId: routine-1');
    expect(prompt).toContain('primaryWorkedMuscles: chest');
    expect(prompt).toContain('priorityMuscles: chest, back');
    expect(prompt).toContain('AVAILABLE EXERCISE ALTERNATIVES');
    expect(prompt).toContain(
      'Only suggest replacementExerciseId values from AVAILABLE EXERCISE ALTERNATIVES. Do not invent exercise IDs.'
    );
  });

  it('calls out incomplete routine templates in the prompt', () => {
    const userContext = createAIUserContext();
    const recommendation = new RoutineRecommendationEngine().run(
      new RoutineRecommendationContextBuilder().build(
        userContext,
        [
          createRoutineTemplate({
            id: 'incomplete-routine',
            daysPerWeek: 1,
            days: [],
          }),
        ],
        [createExercise()]
      )
    )[0];
    const context = new AIRoutineCoachContextBuilder().build({
      userContext,
      recommendedRoutine: recommendation,
    });

    const prompt = new AIRoutineCoachPromptBuilder().build(context);

    expect(prompt).toContain('routineTemplateComplete: false');
    expect(prompt).toContain('Routine template is incomplete');
  });

  it('lists available exercise alternatives in the prompt', () => {
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

    const prompt = new AIRoutineCoachPromptBuilder().build(context);

    expect(prompt).toContain('exerciseId: exercise-alt');
    expect(prompt).toContain('name: Goblet Squat');
    expect(prompt).toContain('reason: same_primary_muscle_match');
    expect(prompt).toContain('matchReasons:');
  });
});
