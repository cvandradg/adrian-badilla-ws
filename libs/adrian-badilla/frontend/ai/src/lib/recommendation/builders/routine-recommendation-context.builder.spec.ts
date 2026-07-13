import { RoutineRecommendationContextBuilder } from './routine-recommendation-context.builder';
import {
  createAIUserContext,
  createExercise,
  createRoutineTemplate,
} from '../testing/routine-recommendation.fixtures';

describe('RoutineRecommendationContextBuilder', () => {
  const builder = new RoutineRecommendationContextBuilder();

  it('builds a complete routine recommendation context', () => {
    const context = builder.build(
      createAIUserContext(),
      [createRoutineTemplate()],
      [createExercise()]
    );

    expect(context.candidates).toHaveLength(1);
    expect(context.candidates[0].resolvedExercises).toHaveLength(1);
    expect(context.candidates[0].missingExercises).toHaveLength(0);
  });

  it('tracks missing exercises without throwing', () => {
    const routine = createRoutineTemplate({
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
    });

    const candidate = builder.build(createAIUserContext(), [routine], [])
      .candidates[0];

    expect(candidate.missingExercises).toHaveLength(1);
    expect(candidate.isIncompleteTemplate).toBe(true);
    expect(candidate.metadata.totalExercises).toBe(1);
    expect(candidate.metadata.resolvedExerciseCount).toBe(0);
    expect(candidate.warnings).toContain('incomplete_routine_template');
    expect(candidate.warnings).toContain('missing_exercises');
  });

  it('marks routines without days as incomplete', () => {
    const routine = createRoutineTemplate({
      daysPerWeek: 1,
      days: [],
    });

    const candidate = builder.build(createAIUserContext(), [routine], [
      createExercise(),
    ]).candidates[0];

    expect(candidate.isIncompleteTemplate).toBe(true);
    expect(candidate.metadata.totalExercises).toBe(0);
    expect(candidate.resolvedExercises).toEqual([]);
    expect(candidate.warnings).toContain('incomplete_routine_template');
  });

  it('supports home users', () => {
    const user = createAIUserContext({
      athleteProfile: {
        ...createAIUserContext().athleteProfile,
        trainingLocation: 'home',
        availableEquipment: ['dumbbells', 'bench', 'bodyweight'],
      },
    });
    const routine = createRoutineTemplate({ trainingLocations: ['home'] });
    const exercise = createExercise({
      requiredEquipment: ['dumbbells'],
      trainingLocations: ['home'],
    });

    const candidate = builder.build(user, [routine], [exercise]).candidates[0];

    expect(candidate.compatibleWithLocation).toBe(true);
    expect(candidate.compatibleWithEquipment).toBe(true);
    expect(candidate.trainingLocation).toBe('home');
  });

  it('treats bodyweight as always available without explicit equipment', () => {
    const user = createAIUserContext({
      athleteProfile: {
        ...createAIUserContext().athleteProfile,
        availableEquipment: [],
      },
    });
    const exercise = createExercise({
      requiredEquipment: ['bodyweight'],
    });

    const candidate = builder.build(user, [createRoutineTemplate()], [exercise])
      .candidates[0];

    expect(candidate.requiredEquipment).toEqual(['bodyweight']);
    expect(candidate.matchedEquipment).toEqual(['bodyweight']);
    expect(candidate.missingEquipment).toEqual([]);
    expect(candidate.compatibleWithEquipment).toBe(true);
    expect(candidate.warnings).not.toContain('missing_equipment');
  });

  it('keeps bodyweight compatible even when the user has other equipment configured', () => {
    const user = createAIUserContext({
      athleteProfile: {
        ...createAIUserContext().athleteProfile,
        availableEquipment: ['barbell'],
      },
    });
    const exercise = createExercise({
      requiredEquipment: ['bodyweight'],
    });

    const candidate = builder.build(user, [createRoutineTemplate()], [exercise])
      .candidates[0];

    expect(candidate.matchedEquipment).toEqual(['bodyweight']);
    expect(candidate.missingEquipment).toEqual([]);
    expect(candidate.compatibleWithEquipment).toBe(true);
  });

  it('supports gym users', () => {
    const candidate = builder.build(
      createAIUserContext(),
      [createRoutineTemplate({ trainingLocations: ['gym'] })],
      [createExercise({ trainingLocations: ['gym'] })]
    ).candidates[0];

    expect(candidate.compatibleWithLocation).toBe(true);
    expect(candidate.trainingLocation).toBe('gym');
  });

  it('treats full_gym as compatible with gym machines', () => {
    const user = createAIUserContext({
      athleteProfile: {
        ...createAIUserContext().athleteProfile,
        availableEquipment: ['full_gym'],
      },
    });
    const exercise = createExercise({
      requiredEquipment: ['cable_machine', 'leg_press', 'pec_deck'],
      trainingLocations: ['gym'],
    });

    const candidate = builder.build(user, [createRoutineTemplate()], [exercise])
      .candidates[0];

    expect(candidate.compatibleWithEquipment).toBe(true);
    expect(candidate.missingEquipment).toEqual([]);
    expect(candidate.matchedEquipment).toEqual(
      expect.arrayContaining(['cable_machine', 'leg_press', 'pec_deck'])
    );
    expect(candidate.warnings).not.toContain('missing_equipment');
  });

  it('supports hybrid users', () => {
    const user = createAIUserContext({
      athleteProfile: {
        ...createAIUserContext().athleteProfile,
        trainingLocation: 'hybrid',
      },
    });
    const routine = createRoutineTemplate({
      trainingLocations: ['home', 'gym'],
    });

    const candidate = builder.build(user, [routine], [createExercise()])
      .candidates[0];

    expect(candidate.trainingLocation).toBe('hybrid');
    expect(candidate.compatibleWithLocation).toBe(true);
  });

  it('does not emit experience warnings for advanced routines', () => {
    const user = createAIUserContext({
      athleteProfile: {
        ...createAIUserContext().athleteProfile,
        trainingExperience: 'beginner',
      },
      metrics: {
        ...createAIUserContext().metrics,
        trainingAgeCategory: 'beginner',
      },
    });
    const routine = createRoutineTemplate({ difficulty: 'advanced' });
    const exercise = createExercise({ technicalDifficulty: 'high' });

    const candidate = builder.build(user, [routine], [exercise]).candidates[0];

    expect(candidate.warnings).not.toContain('experience_mismatch');
  });

  it('detects injuries in contraindications', () => {
    const user = createAIUserContext({
      healthRestrictions: {
        ...createAIUserContext().healthRestrictions,
        hasInjury: true,
        injuryDescription: 'Dolor de hombro',
        injurySeverity: 'moderate',
      },
    });
    const exercise = createExercise({
      contraindications: [
        { condition: 'hombro', severity: 'medium', reason: 'Overhead stress' },
      ],
    });

    const candidate = builder.build(user, [createRoutineTemplate()], [exercise])
      .candidates[0];

    expect(candidate.contraindicatedExercises).toHaveLength(1);
    expect(candidate.warnings).toContain('contraindications_detected');
  });

  it('detects diseases in contraindications', () => {
    const user = createAIUserContext({
      healthRestrictions: {
        ...createAIUserContext().healthRestrictions,
        hasDisease: true,
        diseaseDescription: 'Asma',
        diseaseSeverity: 'moderate',
      },
    });
    const exercise = createExercise({
      contraindications: [
        { condition: 'asma', severity: 'medium', reason: 'Respiratory load' },
      ],
    });

    const candidate = builder.build(user, [createRoutineTemplate()], [exercise])
      .candidates[0];

    expect(candidate.contraindicatedExercises).toHaveLength(1);
  });

  it('flags insufficient equipment', () => {
    const user = createAIUserContext({
      athleteProfile: {
        ...createAIUserContext().athleteProfile,
        trainingLocation: 'home',
        availableEquipment: ['dumbbells'],
      },
    });
    const routine = createRoutineTemplate({ trainingLocations: ['home'] });
    const exercise = createExercise({
      requiredEquipment: ['bench', 'barbell'],
      trainingLocations: ['home'],
    });

    const candidate = builder.build(user, [routine], [exercise]).candidates[0];

    expect(candidate.compatibleWithEquipment).toBe(false);
    expect(candidate.missingEquipment).toEqual(
      expect.arrayContaining(['bench', 'barbell'])
    );
    expect(candidate.warnings).toContain('missing_equipment');
  });

  it('still flags external equipment as missing while excluding bodyweight from missingEquipment', () => {
    const user = createAIUserContext({
      athleteProfile: {
        ...createAIUserContext().athleteProfile,
        availableEquipment: [],
      },
    });
    const exercise = createExercise({
      requiredEquipment: ['bodyweight', 'cable_machine'],
    });

    const candidate = builder.build(user, [createRoutineTemplate()], [exercise])
      .candidates[0];

    expect(candidate.requiredEquipment).toEqual([
      'bodyweight',
      'cable_machine',
    ]);
    expect(candidate.matchedEquipment).toEqual(['bodyweight']);
    expect(candidate.missingEquipment).toEqual(['cable_machine']);
    expect(candidate.warnings).toContain('missing_equipment');
  });

  it('flags session duration greater than preference', () => {
    const user = createAIUserContext({
      athleteProfile: {
        ...createAIUserContext().athleteProfile,
        sessionDuration: 20,
      },
    });
    const routine = createRoutineTemplate({
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
              sets: 10,
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
    });

    const candidate = builder.build(user, [routine], [createExercise()])
      .candidates[0];

    expect(candidate.compatibleWithSchedule).toBe(false);
    expect(candidate.warnings).toContain('session_duration_exceeds_preference');
  });

  it('collects worked muscles by role and as an aggregate diagnostic set', () => {
    const exercise = createExercise({
      primaryMuscles: ['back'],
      secondaryMuscles: ['biceps'],
      stabilizerMuscles: ['core'],
    });

    const candidate = builder.build(
      createAIUserContext(),
      [createRoutineTemplate()],
      [exercise]
    ).candidates[0];

    expect(candidate.primaryWorkedMuscles).toEqual(['back']);
    expect(candidate.secondaryWorkedMuscles).toEqual(['biceps']);
    expect(candidate.stabilizerWorkedMuscles).toEqual(['core']);
    expect(candidate.musclesWorked).toEqual(['back', 'biceps', 'core']);
  });

  it('collects priority muscles worked from primary muscles only', () => {
    const user = createAIUserContext({
      athleteProfile: {
        ...createAIUserContext().athleteProfile,
        priorityMuscles: ['chest', 'back', 'shoulders'],
      },
    });
    const exercise = createExercise({
      primaryMuscles: ['chest'],
      secondaryMuscles: ['shoulders'],
      stabilizerMuscles: ['back'],
    });

    const candidate = builder.build(user, [createRoutineTemplate()], [exercise])
      .candidates[0];

    expect(candidate.priorityMusclesWorked).toEqual(['chest']);
  });

  it('does not collect priority muscles when the user has none configured', () => {
    const user = createAIUserContext({
      athleteProfile: {
        ...createAIUserContext().athleteProfile,
        priorityMuscles: [],
      },
    });
    const exercise = createExercise({
      primaryMuscles: ['glutes'],
      secondaryMuscles: ['hamstrings'],
    });

    const candidate = builder.build(user, [createRoutineTemplate()], [exercise])
      .candidates[0];

    expect(candidate.priorityMusclesWorked).toEqual([]);
  });

  it('does not count secondary or stabilizer muscles as priority coverage', () => {
    const user = createAIUserContext({
      athleteProfile: {
        ...createAIUserContext().athleteProfile,
        priorityMuscles: ['back', 'shoulders'],
      },
    });
    const exercise = createExercise({
      primaryMuscles: ['glutes'],
      secondaryMuscles: ['shoulders'],
      stabilizerMuscles: ['back'],
    });

    const candidate = builder.build(user, [createRoutineTemplate()], [exercise])
      .candidates[0];

    expect(candidate.primaryWorkedMuscles).toEqual(['glutes']);
    expect(candidate.secondaryWorkedMuscles).toEqual(['shoulders']);
    expect(candidate.stabilizerWorkedMuscles).toEqual(['back']);
    expect(candidate.priorityMusclesWorked).toEqual([]);
  });
});
