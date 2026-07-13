import type { ExerciseCreatePayload } from '../models/exercise.model';
import type {
  BodyRegionId,
  EquipmentId,
  ExerciseCategoryId,
  ExerciseTagId,
  ExerciseTypeId,
  MovementPatternId,
  MovementPlaneId,
  MuscleId,
  TrainingLocationId,
} from '../shared/catalogs';

export interface ExerciseDraft extends ExerciseCreatePayload {}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function hasKeyword(text: string, keywords: readonly string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

function unique<T>(values: readonly T[]): T[] {
  return [...new Set(values)];
}

function hasAnyKeywordGroups(
  text: string,
  groups: readonly (readonly string[])[]
): boolean {
  return groups.some((group) => hasKeyword(text, group));
}

const tricepsKeywords = [
  'extension codo',
  'extension de codo',
  'triceps',
  'tricep',
] as const;
const bicepsKeywords = [
  'flexion codo',
  'flexion de codo',
  'curl',
  'martillo',
  'biceps',
] as const;
const shoulderIsolationKeywords = [
  'vuelos laterales',
  'vuelos frontales',
  'elevaciones laterales',
  'elevaciones frontales',
] as const;
const chestIsolationKeywords = ['pec deck', 'peck deck', 'aperturas'] as const;
const backKeywords = ['jalon', 'remo'] as const;
const squatKeywords = ['sentadilla', 'hack', 'press de pierna'] as const;
const kneeExtensionKeywords = [
  'extension rodilla',
  'extension de rodilla',
] as const;
const hamstringKeywords = ['flexion rodilla', 'flexion de rodilla'] as const;
const gluteKeywords = [
  'gluteo',
  'hip thrust',
  'elevacion de pelvis',
  'elevacion pelvis',
] as const;
const abductionKeywords = ['abduccion'] as const;
const adductorKeywords = ['aductor'] as const;
const cardioKeywords = ['caminadora', 'caminar', 'caminata', 'cardio'] as const;

function suggestMovementPattern(text: string): MovementPatternId | '' {
  if (hasKeyword(text, cardioKeywords)) return 'carry';
  if (hasKeyword(text, squatKeywords)) {
    return 'squat';
  }
  if (
    hasKeyword(text, [
      ...hamstringKeywords,
      ...gluteKeywords,
      'peso muerto',
      'bisagra',
    ])
  ) {
    return 'hinge';
  }
  if (hasKeyword(text, adductorKeywords)) return 'squat';
  if (hasKeyword(text, abductionKeywords)) return 'lunge';
  if (hasKeyword(text, [...backKeywords, ...bicepsKeywords])) return 'pull';
  if (
    hasAnyKeywordGroups(text, [
      tricepsKeywords,
      shoulderIsolationKeywords,
      chestIsolationKeywords,
    ])
  ) {
    return 'push';
  }
  if (hasKeyword(text, ['press', 'empuje'])) return 'push';
  return 'push';
}

function suggestExerciseCategory(text: string): ExerciseCategoryId | '' {
  if (
    hasAnyKeywordGroups(text, [
      tricepsKeywords,
      bicepsKeywords,
      shoulderIsolationKeywords,
      chestIsolationKeywords,
      kneeExtensionKeywords,
      hamstringKeywords,
      abductionKeywords,
      adductorKeywords,
    ])
  ) {
    return 'isolation';
  }
  if (
    hasKeyword(text, [
      ...squatKeywords,
      'peso muerto',
      'hip thrust',
      'press',
      ...backKeywords,
    ])
  ) {
    return 'compound';
  }
  if (hasKeyword(text, [...cardioKeywords, 'balance'])) return 'functional';
  return hasKeyword(text, ['curl', 'extension', 'aperturas'])
    ? 'isolation'
    : 'compound';
}

function suggestExerciseType(text: string): ExerciseTypeId | '' {
  if (hasKeyword(text, cardioKeywords)) return 'cardio';
  if (hasKeyword(text, ['movilidad', 'mobility'])) return 'mobility';
  if (hasKeyword(text, ['rehab', 'rehabilitacion', 'rehabilitation'])) {
    return 'rehabilitation';
  }
  if (hasKeyword(text, ['salto', 'jump', 'plyo', 'pliometr'])) return 'power';
  if (
    hasKeyword(text, ['press', 'remo', 'jalon', 'peso muerto', 'sentadilla'])
  ) {
    return 'strength';
  }
  return 'strength';
}

function suggestMovementPlane(text: string): MovementPlaneId | '' {
  if (hasKeyword(text, [...abductionKeywords, ...adductorKeywords, 'lateral']))
    return 'frontal';
  if (hasKeyword(text, ['rotacion', 'twist'])) return 'transverse';
  if (hasKeyword(text, ['carry', 'lunge', 'zancada'])) return 'multiplanar';
  if (hasKeyword(text, cardioKeywords)) return 'sagittal';
  if (
    hasKeyword(text, [
      'press',
      'jalon',
      'remo',
      'sentadilla',
      'peso muerto',
      'hip thrust',
    ])
  ) {
    return 'sagittal';
  }
  return 'sagittal';
}

function suggestBodyRegion(text: string): BodyRegionId {
  if (hasKeyword(text, cardioKeywords)) return 'full_body';
  if (
    hasAnyKeywordGroups(text, [
      tricepsKeywords,
      bicepsKeywords,
      shoulderIsolationKeywords,
      chestIsolationKeywords,
      backKeywords,
      ['press', 'jalon', 'remo'],
    ])
  ) {
    return 'upper_body';
  }
  if (
    hasAnyKeywordGroups(text, [
      squatKeywords,
      kneeExtensionKeywords,
      hamstringKeywords,
      gluteKeywords,
      abductionKeywords,
      adductorKeywords,
    ])
  ) {
    return 'lower_body';
  }
  return 'full_body';
}

function suggestPrimaryMuscles(text: string): MuscleId[] {
  const primary: MuscleId[] = [];

  if (hasKeyword(text, tricepsKeywords)) primary.push('triceps');
  if (hasKeyword(text, bicepsKeywords)) primary.push('biceps');
  if (hasKeyword(text, shoulderIsolationKeywords)) primary.push('shoulders');
  if (hasKeyword(text, chestIsolationKeywords)) primary.push('chest');
  if (hasKeyword(text, ['press de pecho', 'bench', 'press banca']))
    primary.push('chest');
  if (hasKeyword(text, ['press militar', 'shoulder press']))
    primary.push('shoulders');
  if (hasKeyword(text, backKeywords)) primary.push('back');
  if (hasKeyword(text, [...squatKeywords, ...kneeExtensionKeywords])) {
    primary.push('quadriceps');
  }
  if (hasKeyword(text, ['peso muerto', ...hamstringKeywords]))
    primary.push('hamstrings');
  if (hasKeyword(text, [...gluteKeywords, ...abductionKeywords]))
    primary.push('glutes');
  if (hasKeyword(text, adductorKeywords)) primary.push('adductors');

  return unique(primary);
}

function suggestSecondaryMuscles(
  text: string,
  movementPattern: MovementPatternId | ''
): MuscleId[] {
  const secondary: MuscleId[] = [];

  if (hasKeyword(text, chestIsolationKeywords)) secondary.push('shoulders');
  if (hasKeyword(text, backKeywords)) secondary.push('biceps');
  if (hasKeyword(text, squatKeywords)) secondary.push('glutes', 'hamstrings');
  if (hasKeyword(text, [...gluteKeywords, ...hamstringKeywords]))
    secondary.push('hamstrings');
  if (hasKeyword(text, abductionKeywords)) secondary.push('abductors');
  if (movementPattern === 'push') secondary.push('triceps', 'shoulders');
  if (movementPattern === 'pull') secondary.push('biceps', 'rhomboids');
  if (movementPattern === 'squat') secondary.push('glutes', 'core');
  if (movementPattern === 'hinge') secondary.push('glutes', 'lower_back');

  return unique(secondary);
}

function suggestEquipment(text: string): EquipmentId[] {
  const equipment: EquipmentId[] = [];

  if (hasKeyword(text, ['press de pierna'])) equipment.push('leg_press');
  if (hasKeyword(text, ['hack'])) equipment.push('hack_squat_machine');
  if (hasKeyword(text, ['smith'])) equipment.push('smith_machine');
  if (hasKeyword(text, ['maquina', 'máquina'])) equipment.push('machine');
  if (hasKeyword(text, ['polea'])) equipment.push('cable_machine');
  if (hasKeyword(text, ['mancuerna'])) equipment.push('dumbbells');
  if (hasKeyword(text, ['barra'])) equipment.push('barbell');
  if (hasKeyword(text, ['caminadora'])) equipment.push('treadmill');

  if (equipment.length === 0) equipment.push('bodyweight');

  return unique(equipment);
}

function suggestTrainingLocations(
  text: string,
  requiredEquipment: EquipmentId[]
): TrainingLocationId[] {
  if (
    requiredEquipment.some((item) =>
      [
        'machine',
        'cable_machine',
        'smith_machine',
        'treadmill',
        'leg_press',
        'hack_squat_machine',
      ].includes(item)
    )
  ) {
    return ['gym'];
  }

  if (
    requiredEquipment.every(
      (item) => item === 'bodyweight' || item === 'dumbbells'
    )
  ) {
    return ['home', 'gym'];
  }

  return ['gym'];
}

function suggestTags(
  text: string,
  requiredEquipment: EquipmentId[]
): ExerciseTagId[] {
  const tags: ExerciseTagId[] = [];

  if (hasKeyword(text, ['rehab', 'rehabilitacion', 'rehabilitation'])) {
    tags.push('rehabilitation');
  }
  if (hasKeyword(text, ['warmup', 'calentamiento'])) tags.push('warmup');
  if (hasKeyword(text, ['movilidad', 'mobility'])) tags.push('mobility');
  if (hasKeyword(text, ['salto', 'jump', 'plyo', 'pliometr'])) {
    tags.push('explosive', 'plyometric');
  }
  if (hasKeyword(text, ['unilateral'])) tags.push('unilateral');
  if (hasKeyword(text, ['bilateral'])) tags.push('bilateral');
  if (
    requiredEquipment.some((item) =>
      ['machine', 'smith_machine', 'leg_press', 'hack_squat_machine'].includes(
        item
      )
    )
  ) {
    tags.push('machine');
  }
  if (hasKeyword(text, cardioKeywords)) tags.push('time_based');
  if (
    requiredEquipment.some((item) => item === 'dumbbells' || item === 'barbell')
  ) {
    tags.push('free_weight');
  }
  if (hasKeyword(text, ['carry', 'agarre', 'farmer']))
    tags.push('grip_intensive');
  if (hasKeyword(text, ['balance', 'equilibrio'])) tags.push('balance');

  return unique(tags);
}

function suggestLevel(
  text: string,
  movementPattern: MovementPatternId | '',
  exerciseCategory: ExerciseCategoryId | ''
): 'low' | 'medium' | 'high' {
  if (hasKeyword(text, ['olympic', 'snatch', 'clean', 'jerk'])) return 'high';
  if (hasKeyword(text, cardioKeywords)) return 'low';
  if (
    hasKeyword(text, ['peso muerto', 'hack', 'hip thrust']) ||
    movementPattern === 'hinge'
  ) {
    return 'medium';
  }
  if (exerciseCategory === 'isolation') return 'low';
  return 'medium';
}

export function createExerciseDraftFromName(name: string): ExerciseDraft {
  const normalizedName = name.trim();
  const text = normalizeText(normalizedName);
  const movementPattern = suggestMovementPattern(text);
  const exerciseCategory = suggestExerciseCategory(text);
  const requiredEquipment = suggestEquipment(text);
  const technicalDifficulty = suggestLevel(
    text,
    movementPattern,
    exerciseCategory
  );
  const riskLevel = suggestLevel(text, movementPattern, exerciseCategory);
  let fatigueLevel: 'low' | 'medium' | 'high' = 'medium';

  if (movementPattern === 'squat' || movementPattern === 'hinge') {
    fatigueLevel = 'high';
  }

  return {
    name: normalizedName,
    description: 'Pendiente de revisión.',
    instructions: [],
    tips: [],
    commonMistakes: [],
    primaryMuscles: suggestPrimaryMuscles(text),
    secondaryMuscles: suggestSecondaryMuscles(text, movementPattern),
    stabilizerMuscles:
      movementPattern === 'push' ||
      movementPattern === 'pull' ||
      movementPattern === 'squat' ||
      movementPattern === 'hinge'
        ? ['core']
        : [],
    bodyRegion: suggestBodyRegion(text),
    movementPattern,
    movementPlane: suggestMovementPlane(text),
    exerciseCategory,
    exerciseType: suggestExerciseType(text),
    technicalDifficulty,
    riskLevel,
    fatigueLevel,
    requiredEquipment,
    optionalEquipment: [],
    trainingLocations: suggestTrainingLocations(text, requiredEquipment),
    contraindications: [],
    alternativeExerciseIds: [],
    goals: ['muscle_gain'],
    tags: suggestTags(text, requiredEquipment),
    videoUrl: '',
    thumbnailUrl: '',
    isCompound: exerciseCategory === 'compound',
    isUnilateral: hasKeyword(text, ['unilateral']),
    isBodyweight:
      requiredEquipment.length === 1 && requiredEquipment[0] === 'bodyweight',
    isActive: true,
  };
}
