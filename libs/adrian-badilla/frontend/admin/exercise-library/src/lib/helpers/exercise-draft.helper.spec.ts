import { createExerciseDraftFromName } from './exercise-draft.helper';

describe('createExerciseDraftFromName', () => {
  it('infers triceps cable extension drafts', () => {
    const draft = createExerciseDraftFromName('Extensión de codo polea barra');

    expect(draft.primaryMuscles).toEqual(expect.arrayContaining(['triceps']));
    expect(draft.movementPattern).toBe('push');
    expect(draft.exerciseCategory).toBe('isolation');
    expect(draft.bodyRegion).toBe('upper_body');
    expect(draft.requiredEquipment).toEqual(
      expect.arrayContaining(['cable_machine', 'barbell'])
    );
  });

  it('infers shoulder isolation with dumbbells', () => {
    const draft = createExerciseDraftFromName('Vuelos laterales mancuerna');

    expect(draft.primaryMuscles).toEqual(['shoulders']);
    expect(draft.movementPattern).toBe('push');
    expect(draft.exerciseCategory).toBe('isolation');
    expect(draft.bodyRegion).toBe('upper_body');
    expect(draft.requiredEquipment).toContain('dumbbells');
  });

  it('infers pec deck machine drafts', () => {
    const draft = createExerciseDraftFromName('Pec deck máquina');

    expect(draft.primaryMuscles).toContain('chest');
    expect(draft.secondaryMuscles).toContain('shoulders');
    expect(draft.exerciseCategory).toBe('isolation');
    expect(draft.movementPattern).toBe('push');
    expect(draft.bodyRegion).toBe('upper_body');
    expect(draft.tags).toContain('machine');
  });

  it('infers hamstring curl seated machine drafts', () => {
    const draft = createExerciseDraftFromName(
      'Flexión rodilla máquina sentada'
    );

    expect(draft.primaryMuscles).toContain('hamstrings');
    expect(draft.exerciseCategory).toBe('isolation');
    expect(draft.movementPattern).toBe('hinge');
    expect(draft.bodyRegion).toBe('lower_body');
    expect(draft.requiredEquipment).toContain('machine');
  });

  it('infers cardio treadmill drafts', () => {
    const draft = createExerciseDraftFromName('Caminadora');

    expect(draft.exerciseType).toBe('cardio');
    expect(draft.bodyRegion).toBe('full_body');
    expect(draft.movementPattern).toBe('carry');
    expect(draft.technicalDifficulty).toBe('low');
    expect(draft.riskLevel).toBe('low');
    expect(draft.fatigueLevel).toBe('medium');
    expect(draft.requiredEquipment).toContain('treadmill');
  });

  it('infers seated adductor machine drafts', () => {
    const draft = createExerciseDraftFromName('Aductor máquina sentada');

    expect(draft.primaryMuscles).toContain('adductors');
    expect(draft.exerciseCategory).toBe('isolation');
    expect(draft.movementPattern).toBe('squat');
    expect(draft.bodyRegion).toBe('lower_body');
    expect(draft.requiredEquipment).toContain('machine');
  });

  it('infers hack squat machine drafts', () => {
    const draft = createExerciseDraftFromName('Sentadilla hack inclinada');

    expect(draft.movementPattern).toBe('squat');
    expect(draft.primaryMuscles).toContain('quadriceps');
    expect(draft.secondaryMuscles).toEqual(
      expect.arrayContaining(['glutes', 'hamstrings'])
    );
    expect(draft.exerciseCategory).toBe('compound');
    expect(draft.bodyRegion).toBe('lower_body');
    expect(draft.requiredEquipment).toContain('hack_squat_machine');
  });

  it('still infers push patterns and free weights from barbell press names', () => {
    const draft = createExerciseDraftFromName('Barra Bench Press');

    expect(draft.movementPattern).toBe('push');
    expect(draft.exerciseCategory).toBe('compound');
    expect(draft.requiredEquipment).toContain('barbell');
    expect(draft.tags).toContain('free_weight');
    expect(draft.technicalDifficulty).toBe('medium');
    expect(draft.isActive).toBe(true);
  });
});
