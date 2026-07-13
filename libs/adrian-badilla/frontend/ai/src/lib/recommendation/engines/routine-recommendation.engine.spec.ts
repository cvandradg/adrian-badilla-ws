import { RoutineRecommendationContextBuilder } from '../builders/routine-recommendation-context.builder';
import { RoutineRecommendationEngine } from './routine-recommendation.engine';
import {
  detectRestrictedMovementPatterns,
  evaluateHealthRestrictions,
} from './routine-recommendation-rules';
import {
  createAIUserContext,
  createExercise,
  createRoutineTemplate,
} from '../testing/routine-recommendation.fixtures';

describe('RoutineRecommendationEngine', () => {
  const contextBuilder = new RoutineRecommendationContextBuilder();
  const engine = new RoutineRecommendationEngine();

  function buildResults(input?: {
    user?: Parameters<typeof createAIUserContext>[0];
    routines?: ReturnType<typeof createRoutineTemplate>[];
    exercises?: ReturnType<typeof createExercise>[];
  }) {
    const userContext = createAIUserContext(input?.user);
    const routines = input?.routines ?? [createRoutineTemplate()];
    const exercises = input?.exercises ?? [createExercise()];
    const context = contextBuilder.build(userContext, routines, exercises);

    return engine.run(context);
  }

  it('scores an ideal routine highly', () => {
    const result = buildResults()[0];

    expect(result.routineId).toBe('routine-1');
    expect(result.score).toBe(90);
    expect(result.reasons.map((item) => item.code)).toEqual(
      expect.arrayContaining([
        'goal_match',
        'equipment_compatible',
        'location_compatible',
        'schedule_compatible',
        'session_duration_compatible',
        'priority_muscles_worked',
      ])
    );
    expect(result.penalties).toHaveLength(0);
  });

  it('penalizes a routine with the wrong goal', () => {
    const result = buildResults({
      routines: [createRoutineTemplate({ goals: ['fat_loss'] })],
    })[0];

    expect(result.reasons.map((item) => item.code)).not.toContain('goal_match');
    expect(result.score).toBeLessThan(120);
  });

  it('does not penalize a beginner user for an advanced routine', () => {
    const result = buildResults({
      user: {
        metrics: {
          ...createAIUserContext().metrics,
          trainingAgeCategory: 'beginner',
        },
        athleteProfile: {
          ...createAIUserContext().athleteProfile,
          trainingExperience: 'beginner',
        },
      },
      routines: [createRoutineTemplate({ difficulty: 'advanced' })],
      exercises: [createExercise({ technicalDifficulty: 'high' })],
    })[0];

    expect(result.penalties.map((item) => item.code)).not.toContain(
      'experience_mismatch'
    );
    expect(result.warnings).not.toContain('experience_mismatch');
    expect(result.requiredAdaptations).not.toContain('experience_mismatch');
  });

  it('penalizes a routine with missing equipment', () => {
    const result = buildResults({
      user: {
        athleteProfile: {
          ...createAIUserContext().athleteProfile,
          trainingLocation: 'home',
          availableEquipment: ['dumbbells'],
        },
      },
      routines: [createRoutineTemplate({ trainingLocations: ['home'] })],
      exercises: [
        createExercise({
          requiredEquipment: ['bench', 'barbell'],
          trainingLocations: ['home'],
        }),
      ],
    })[0];

    expect(result.penalties.map((item) => item.code)).toContain(
      'missing_equipment'
    );
    expect(result.requiredAdaptations).toContain('equipment_substitutions');
  });

  it('does not penalize full_gym users for gym equipment requirements', () => {
    const result = buildResults({
      user: {
        athleteProfile: {
          ...createAIUserContext().athleteProfile,
          availableEquipment: ['full_gym'],
        },
      },
      exercises: [
        createExercise({
          requiredEquipment: ['machine', 'cable_machine', 'smith_machine'],
          trainingLocations: ['gym'],
        }),
      ],
    })[0];

    expect(result.penalties.map((item) => item.code)).not.toContain(
      'missing_equipment'
    );
    expect(result.candidate.missingEquipment).toEqual([]);
    expect(result.reasons.map((item) => item.code)).toContain(
      'equipment_compatible'
    );
  });

  it('does not penalize bodyweight-only routines when the user has no explicit equipment', () => {
    const result = buildResults({
      user: {
        athleteProfile: {
          ...createAIUserContext().athleteProfile,
          availableEquipment: [],
        },
      },
      exercises: [
        createExercise({
          requiredEquipment: ['bodyweight'],
        }),
      ],
    })[0];

    expect(result.candidate.missingEquipment).toEqual([]);
    expect(result.penalties.map((item) => item.code)).not.toContain(
      'missing_equipment'
    );
    expect(result.reasons.map((item) => item.code)).toContain(
      'equipment_compatible'
    );
  });

  it('penalizes a routine with contraindications', () => {
    const result = buildResults({
      user: {
        healthRestrictions: {
          ...createAIUserContext().healthRestrictions,
          hasInjury: true,
          injuryDescription: 'Dolor de hombro',
          injurySeverity: 'moderate',
        },
      },
      exercises: [
        createExercise({
          contraindications: [
            { condition: 'hombro', severity: 'medium', reason: 'stress' },
          ],
        }),
      ],
    })[0];

    expect(result.penalties.map((item) => item.code)).toContain(
      'contraindications'
    );
    expect(result.requiredAdaptations).toContain('exercise_substitutions');
  });

  it('keeps legacy contraindication diagnostics unchanged with empty structured restrictions', () => {
    const result = buildResults({
      user: {
        healthRestrictions: {
          hasInjury: true,
          injuryDescription: 'Dolor de hombro',
          injurySeverity: 'moderate',
          hasDisease: false,
          diseaseDescription: '',
          diseaseSeverity: null,
          injuries: [],
          medicalConditions: [],
          restrictedMovementPatternIds: [],
        },
      },
      exercises: [
        createExercise({
          contraindications: [
            { condition: 'hombro', severity: 'medium', reason: 'stress' },
          ],
        }),
      ],
    })[0];

    expect(result.score).toBe(40);
    expect(result.penalties.map((item) => item.code)).toEqual([
      'contraindications',
    ]);
    expect(result.candidate.contraindicatedExercises).toEqual([
      {
        dayId: 'day-1',
        dayName: 'Day 1',
        exerciseId: 'exercise-1',
        exerciseName: 'Bench Press',
        reasons: ['contraindication:hombro'],
      },
    ]);
  });

  it('penalizes a routine with excessive duration', () => {
    const result = buildResults({
      user: {
        athleteProfile: {
          ...createAIUserContext().athleteProfile,
          sessionDuration: 20,
        },
      },
      routines: [
        createRoutineTemplate({
          days: [
            {
              dayId: 'day-1',
              name: 'Day 1',
              order: 0,
              exercises: [
                {
                  exId: 'slot-1',
                  exerciseId: 'exercise-1',
                  order: 0,
                  sets: 14,
                  repsMin: 10,
                  repsMax: 12,
                  restSeconds: 120,
                  tempo: '2-0-2-0',
                  rir: 1,
                  notes: '',
                },
              ],
            },
          ],
        }),
      ],
    })[0];

    expect(result.penalties.map((item) => item.code)).toContain(
      'excessive_duration'
    );
    expect(result.requiredAdaptations).toContain('volume_reduction');
  });

  it('warns and heavily penalizes routines without days', () => {
    const result = buildResults({
      routines: [
        createRoutineTemplate({
          id: 'empty-routine',
          daysPerWeek: 1,
          days: [],
        }),
      ],
    })[0];

    expect(result.candidate.isIncompleteTemplate).toBe(true);
    expect(result.warnings).toContain('incomplete_routine_template');
    expect(result.penalties.map((item) => item.code)).toContain(
      'incomplete_routine_template'
    );
    expect(result.requiredAdaptations).toContain('routine_template_incomplete');
    expect(result.score).toBeLessThan(0);
  });

  it('warns and heavily penalizes routines without resolved exercises', () => {
    const result = buildResults({
      routines: [
        createRoutineTemplate({
          id: 'missing-exercise-routine',
          days: [
            {
              dayId: 'day-1',
              name: 'Day 1',
              order: 0,
              exercises: [
                {
                  exId: 'slot-1',
                  exerciseId: 'missing-exercise',
                  order: 0,
                  sets: 3,
                  repsMin: 10,
                  repsMax: 12,
                  restSeconds: 60,
                  tempo: '2-0-2-0',
                  rir: 2,
                  notes: '',
                },
              ],
            },
          ],
        }),
      ],
      exercises: [createExercise()],
    })[0];

    expect(result.candidate.isIncompleteTemplate).toBe(true);
    expect(result.candidate.resolvedExercises).toEqual([]);
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        'incomplete_routine_template',
        'missing_exercises',
      ])
    );
    expect(result.penalties.map((item) => item.code)).toContain(
      'incomplete_routine_template'
    );
    expect(result.requiredAdaptations).toContain('routine_template_incomplete');
  });

  it('orders multiple routines by score and assigns rank', () => {
    const results = buildResults({
      routines: [
        createRoutineTemplate({ id: 'ideal-routine', goals: ['muscle_gain'] }),
        createRoutineTemplate({
          id: 'weak-routine',
          goals: ['fat_loss'],
          trainingLocations: ['home'],
          difficulty: 'advanced',
        }),
      ],
      exercises: [
        createExercise(),
        createExercise({
          id: 'exercise-2',
          name: 'Overhead Press',
          technicalDifficulty: 'high',
          trainingLocations: ['home'],
          requiredEquipment: ['bench', 'barbell'],
        }),
      ],
    });

    expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
    expect(results[0].rank).toBe(1);
    expect(results[1].rank).toBe(2);
  });

  it('ranks complete routines above incomplete ones', () => {
    const results = buildResults({
      routines: [
        createRoutineTemplate({
          id: 'incomplete-routine',
          name: 'Incomplete',
          daysPerWeek: 1,
          days: [],
        }),
        createRoutineTemplate({
          id: 'complete-routine',
          name: 'Complete',
        }),
      ],
      exercises: [createExercise()],
    });

    expect(results.map((item) => item.routineId)).toEqual([
      'complete-routine',
      'incomplete-routine',
    ]);
    expect(results[0].candidate.isIncompleteTemplate).toBe(false);
    expect(results[1].candidate.isIncompleteTemplate).toBe(true);
    expect(results[0].score).toBeGreaterThan(results[1].score);
  });

  it('keeps ranking and score identical when structured restrictions are absent', () => {
    const routines = [
      createRoutineTemplate({ id: 'ideal-routine', goals: ['muscle_gain'] }),
      createRoutineTemplate({ id: 'weak-routine', goals: ['fat_loss'] }),
    ];
    const baseline = buildResults({ routines });
    const withEmptyHealthRestrictions = buildResults({
      user: {
        healthRestrictions: {},
      },
      routines,
    });

    expect(
      withEmptyHealthRestrictions.map((item) => ({
        routineId: item.routineId,
        score: item.score,
        normalizedScore: item.normalizedScore,
        rank: item.rank,
        warnings: item.warnings,
        penalties: item.penalties,
        requiredAdaptations: item.requiredAdaptations,
      }))
    ).toEqual(
      baseline.map((item) => ({
        routineId: item.routineId,
        score: item.score,
        normalizedScore: item.normalizedScore,
        rank: item.rank,
        warnings: item.warnings,
        penalties: item.penalties,
        requiredAdaptations: item.requiredAdaptations,
      }))
    );
  });

  it('keeps health restriction extension points neutral', () => {
    const result = buildResults()[0];

    expect(
      evaluateHealthRestrictions(createAIUserContext(), result.candidate)
    ).toEqual({
      warnings: [],
      penalties: [],
      requiredAdaptations: [],
    });
    expect(
      detectRestrictedMovementPatterns(createAIUserContext(), result.candidate)
    ).toEqual([]);
  });

  it('does not change ranking based on legacy routine difficulty', () => {
    const results = buildResults({
      routines: [
        createRoutineTemplate({ id: 'advanced-routine', difficulty: 'advanced' }),
        createRoutineTemplate({ id: 'beginner-routine', difficulty: 'beginner' }),
      ],
      exercises: [createExercise({ technicalDifficulty: 'high' })],
    });

    expect(results.map((item) => item.routineId)).toEqual([
      'advanced-routine',
      'beginner-routine',
    ]);
    expect(results[0].score).toBe(results[1].score);
  });

  it('keeps normalized scores between 0 and 100', () => {
    const results = buildResults({
      routines: [
        createRoutineTemplate({ id: 'high' }),
        createRoutineTemplate({ id: 'low', goals: ['fat_loss'] }),
      ],
    });

    for (const result of results) {
      expect(result.normalizedScore).toBeGreaterThanOrEqual(0);
      expect(result.normalizedScore).toBeLessThanOrEqual(100);
    }
  });

  it('only awards priority muscle bonus when the user configured priority muscles', () => {
    const result = buildResults({
      user: {
        athleteProfile: {
          ...createAIUserContext().athleteProfile,
          priorityMuscles: [],
        },
      },
      exercises: [
        createExercise({
          primaryMuscles: ['chest'],
          secondaryMuscles: ['triceps'],
        }),
      ],
    })[0];

    expect(result.candidate.priorityMusclesWorked).toEqual([]);
    expect(result.reasons.map((item) => item.code)).not.toContain(
      'priority_muscles_worked'
    );
  });

  it('awards 0 bonus when 0 of 3 priority muscles are worked as primary', () => {
    const result = buildResults({
      user: {
        athleteProfile: {
          ...createAIUserContext().athleteProfile,
          priorityMuscles: ['chest', 'back', 'shoulders'],
        },
      },
      exercises: [
        createExercise({
          primaryMuscles: ['glutes'],
          secondaryMuscles: ['hamstrings'],
          stabilizerMuscles: ['core'],
        }),
      ],
    })[0];

    expect(result.candidate.priorityMusclesWorked).toEqual([]);
    expect(result.reasons.map((item) => item.code)).not.toContain(
      'priority_muscles_worked'
    );
  });

  it('awards about 3 points when 1 of 3 priority muscles are worked as primary', () => {
    const result = buildResults({
      user: {
        athleteProfile: {
          ...createAIUserContext().athleteProfile,
          priorityMuscles: ['chest', 'back', 'shoulders'],
        },
      },
      exercises: [
        createExercise({
          primaryMuscles: ['chest'],
          secondaryMuscles: ['triceps'],
          stabilizerMuscles: ['core'],
        }),
      ],
    })[0];

    const priorityReason = result.reasons.find(
      (item) => item.code === 'priority_muscles_worked'
    );

    expect(result.candidate.priorityMusclesWorked).toEqual(['chest']);
    expect(priorityReason?.points).toBe(3);
    expect(priorityReason?.label).toContain('1/3');
    expect(priorityReason?.label).toContain('33%');
  });

  it('awards about 7 points when 2 of 3 priority muscles are worked as primary', () => {
    const result = buildResults({
      user: {
        athleteProfile: {
          ...createAIUserContext().athleteProfile,
          priorityMuscles: ['chest', 'back', 'shoulders'],
        },
      },
      exercises: [
        createExercise({
          primaryMuscles: ['chest', 'shoulders'],
          secondaryMuscles: ['triceps'],
          stabilizerMuscles: ['core'],
        }),
      ],
    })[0];

    const priorityReason = result.reasons.find(
      (item) => item.code === 'priority_muscles_worked'
    );

    expect(result.candidate.priorityMusclesWorked).toEqual([
      'chest',
      'shoulders',
    ]);
    expect(priorityReason?.points).toBe(7);
    expect(priorityReason?.label).toContain('2/3');
    expect(priorityReason?.label).toContain('67%');
  });

  it('awards 10 points when 3 of 3 priority muscles are worked as primary', () => {
    const result = buildResults({
      user: {
        athleteProfile: {
          ...createAIUserContext().athleteProfile,
          priorityMuscles: ['chest', 'back', 'shoulders'],
        },
      },
      exercises: [
        createExercise({
          primaryMuscles: ['chest', 'back', 'shoulders'],
          secondaryMuscles: ['triceps'],
          stabilizerMuscles: ['core'],
        }),
      ],
    })[0];

    const priorityReason = result.reasons.find(
      (item) => item.code === 'priority_muscles_worked'
    );

    expect(result.candidate.priorityMusclesWorked).toEqual([
      'chest',
      'back',
      'shoulders',
    ]);
    expect(priorityReason?.points).toBe(10);
    expect(priorityReason?.label).toContain('3/3');
    expect(priorityReason?.label).toContain('100%');
  });

  it('does not award bonus for muscles that only appear as stabilizers', () => {
    const result = buildResults({
      user: {
        athleteProfile: {
          ...createAIUserContext().athleteProfile,
          priorityMuscles: ['back'],
        },
      },
      exercises: [
        createExercise({
          primaryMuscles: ['glutes'],
          secondaryMuscles: ['hamstrings'],
          stabilizerMuscles: ['back'],
        }),
      ],
    })[0];

    expect(result.candidate.priorityMusclesWorked).toEqual([]);
    expect(result.reasons.map((item) => item.code)).not.toContain(
      'priority_muscles_worked'
    );
  });

  it('does not award bonus for muscles that only appear as secondary', () => {
    const result = buildResults({
      user: {
        athleteProfile: {
          ...createAIUserContext().athleteProfile,
          priorityMuscles: ['shoulders'],
        },
      },
      exercises: [
        createExercise({
          primaryMuscles: ['chest'],
          secondaryMuscles: ['shoulders'],
          stabilizerMuscles: ['core'],
        }),
      ],
    })[0];

    expect(result.candidate.priorityMusclesWorked).toEqual([]);
    expect(result.reasons.map((item) => item.code)).not.toContain(
      'priority_muscles_worked'
    );
  });

  it('does not award glute priority bonus when glutes were not selected', () => {
    const result = buildResults({
      user: {
        athleteProfile: {
          ...createAIUserContext().athleteProfile,
          priorityMuscles: ['chest'],
        },
      },
      exercises: [
        createExercise({
          primaryMuscles: ['glutes'],
          secondaryMuscles: ['hamstrings'],
        }),
      ],
    })[0];

    expect(result.candidate.priorityMusclesWorked).toEqual([]);
    expect(result.reasons.map((item) => item.code)).not.toContain(
      'priority_muscles_worked'
    );
  });
});
