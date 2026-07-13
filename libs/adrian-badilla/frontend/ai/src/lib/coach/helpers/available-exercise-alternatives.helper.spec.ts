import { findAvailableExerciseAlternatives } from './available-exercise-alternatives.helper';
import {
  createAIUserContext,
  createExercise,
  createRoutineTemplate,
} from '../../recommendation/testing/routine-recommendation.fixtures';
import { RoutineRecommendationContextBuilder } from '../../recommendation/builders/routine-recommendation-context.builder';

describe('findAvailableExerciseAlternatives', () => {
  const userContext = createAIUserContext({
    athleteProfile: {
      ...createAIUserContext().athleteProfile,
      trainingLocation: 'home',
      availableEquipment: ['dumbbells', 'bodyweight'],
      priorityMuscles: ['chest', 'back'],
    },
  });

  function buildCandidate() {
    return new RoutineRecommendationContextBuilder().build(
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
          name: 'Flat Barbell Bench Press',
          primaryMuscles: ['chest'],
          secondaryMuscles: ['triceps'],
          bodyRegion: 'upper_body',
          movementPattern: 'push',
          goals: ['muscle_gain'],
          trainingLocations: ['home'],
          requiredEquipment: ['barbell'],
        }),
      ]
    ).candidates[0];
  }

  function findAlternatives(exerciseLibrary = [] as ReturnType<typeof createExercise>[]) {
    const candidate = buildCandidate();

    return findAvailableExerciseAlternatives({
      userAvailableEquipment: userContext.athleteProfile.availableEquipment,
      userTrainingLocation: userContext.athleteProfile.trainingLocation,
      userPriorityMuscles: userContext.athleteProfile.priorityMuscles,
      missingEquipment: candidate.missingEquipment,
      resolvedExercises: candidate.resolvedExercises,
      exerciseLibrary,
    });
  }

  it('returns an empty list when exerciseLibrary is not provided', () => {
    expect(findAlternatives()).toEqual([]);
  });

  it('prioritizes same primary muscle first', () => {
    const alternatives = findAlternatives([
      createExercise({
        id: 'pattern-only',
        name: 'Standing Band Press',
        primaryMuscles: ['shoulders'],
        secondaryMuscles: ['triceps'],
        bodyRegion: 'upper_body',
        movementPattern: 'push',
        goals: ['muscle_gain'],
        trainingLocations: ['home'],
        requiredEquipment: ['bodyweight'],
      }),
      createExercise({
        id: 'same-primary',
        name: 'Push Up',
        primaryMuscles: ['chest'],
        secondaryMuscles: ['triceps'],
        bodyRegion: 'upper_body',
        movementPattern: 'push',
        goals: ['muscle_gain'],
        trainingLocations: ['home'],
        requiredEquipment: ['bodyweight'],
      }),
    ]);

    expect(alternatives[0].exerciseId).toBe('same-primary');
    expect(alternatives[0].matchReasons).toEqual(
      expect.arrayContaining([
        'same_primary_muscle',
        'same_movement_pattern',
        'same_body_region',
        'priority_user_muscle',
        'shared_goal',
      ])
    );
  });

  it('prioritizes same movement pattern when no same primary muscle exists', () => {
    const alternatives = findAlternatives([
      createExercise({
        id: 'same-pattern',
        name: 'Standing Band Press',
        primaryMuscles: ['shoulders'],
        secondaryMuscles: ['triceps'],
        bodyRegion: 'upper_body',
        movementPattern: 'push',
        goals: ['muscle_gain'],
        trainingLocations: ['home'],
        requiredEquipment: ['bodyweight'],
      }),
      createExercise({
        id: 'same-region',
        name: 'Dumbbell Curl',
        primaryMuscles: ['biceps'],
        secondaryMuscles: [],
        bodyRegion: 'upper_body',
        movementPattern: 'pull',
        goals: ['muscle_gain'],
        trainingLocations: ['home'],
        requiredEquipment: ['dumbbells'],
      }),
    ]);

    expect(alternatives[0].exerciseId).toBe('same-pattern');
    expect(alternatives[0].matchReasons).toContain('same_movement_pattern');
    expect(alternatives[0].matchReasons).not.toContain('same_primary_muscle');
  });

  it('prioritizes same body region when no same primary muscle or pattern exists', () => {
    const alternatives = findAlternatives([
      createExercise({
        id: 'same-region',
        name: 'Dumbbell Curl',
        primaryMuscles: ['biceps'],
        secondaryMuscles: [],
        bodyRegion: 'upper_body',
        movementPattern: 'pull',
        goals: ['muscle_gain'],
        trainingLocations: ['home'],
        requiredEquipment: ['dumbbells'],
      }),
      createExercise({
        id: 'lower-body',
        name: 'Goblet Squat',
        primaryMuscles: ['quadriceps'],
        secondaryMuscles: ['glutes'],
        bodyRegion: 'lower_body',
        movementPattern: 'squat',
        goals: ['muscle_gain'],
        trainingLocations: ['home'],
        requiredEquipment: ['dumbbells'],
      }),
    ]);

    expect(alternatives[0].exerciseId).toBe('same-region');
    expect(alternatives[0].matchReasons).toContain('same_body_region');
  });

  it('never prioritizes a lower-body exercise over an upper-body one when an upper-body alternative exists', () => {
    const alternatives = findAlternatives([
      createExercise({
        id: 'lower-body',
        name: 'Goblet Squat',
        primaryMuscles: ['quadriceps'],
        secondaryMuscles: ['glutes'],
        bodyRegion: 'lower_body',
        movementPattern: 'squat',
        goals: ['muscle_gain'],
        trainingLocations: ['home'],
        requiredEquipment: ['dumbbells'],
      }),
      createExercise({
        id: 'upper-body',
        name: 'Dumbbell Floor Press',
        primaryMuscles: ['chest'],
        secondaryMuscles: ['triceps'],
        bodyRegion: 'upper_body',
        movementPattern: 'push',
        goals: ['muscle_gain'],
        trainingLocations: ['home'],
        requiredEquipment: ['dumbbells'],
      }),
    ]);

    expect(alternatives.map((item) => item.exerciseId)).toEqual([
      'upper-body',
      'lower-body',
    ]);
  });

  it('excludes used, inactive, or incompatible exercises', () => {
    const alternatives = findAlternatives([
      createExercise({
        id: 'exercise-used',
        name: 'Duplicate Used Exercise',
        primaryMuscles: ['chest'],
        bodyRegion: 'upper_body',
        movementPattern: 'push',
        trainingLocations: ['home'],
        requiredEquipment: ['bodyweight'],
      }),
      createExercise({
        id: 'inactive',
        isActive: false,
        bodyRegion: 'upper_body',
        movementPattern: 'push',
        trainingLocations: ['home'],
        requiredEquipment: ['bodyweight'],
      }),
      createExercise({
        id: 'cable-only',
        bodyRegion: 'upper_body',
        movementPattern: 'push',
        trainingLocations: ['home'],
        requiredEquipment: ['cable_machine'],
      }),
    ]);

    expect(alternatives).toEqual([]);
  });

  it('returns a stable deterministic order for ties', () => {
    const alternatives = findAlternatives([
      createExercise({
        id: 'b-exercise',
        name: 'B Press',
        primaryMuscles: ['back'],
        secondaryMuscles: ['biceps'],
        bodyRegion: 'upper_body',
        movementPattern: 'pull',
        goals: ['muscle_gain'],
        trainingLocations: ['home'],
        requiredEquipment: ['bodyweight'],
      }),
      createExercise({
        id: 'a-exercise',
        name: 'A Press',
        primaryMuscles: ['back'],
        secondaryMuscles: ['biceps'],
        bodyRegion: 'upper_body',
        movementPattern: 'pull',
        goals: ['muscle_gain'],
        trainingLocations: ['home'],
        requiredEquipment: ['bodyweight'],
      }),
    ]);

    expect(alternatives.map((item) => item.exerciseId)).toEqual([
      'a-exercise',
      'b-exercise',
    ]);
  });
});
