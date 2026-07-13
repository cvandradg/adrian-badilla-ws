import type { Exercise } from '@admin/exercise-library';
import type { RoutineExercise, RoutineTemplate } from '@admin/routine-builder';
import type { GoalId } from '../../shared/catalogs/athlete-profile.catalogs';
import type { AIUserContext } from '../../context/models/ai-user-context.model';
import type {
  RecommendationExerciseEquipmentId,
  RecommendationGoalId,
  RecommendationMuscleId,
  RecommendationTrainingLocationId,
  RoutineRecommendationContraindicatedExercise,
  RoutineRecommendationMissingExercise,
  RoutineRecommendationResolvedExercise,
} from '../models/routine-recommendation-context.model';

function unique<T>(values: readonly T[]): T[] {
  return [...new Set(values)];
}

export interface WorkedMusclesByRole {
  primaryWorkedMuscles: RecommendationMuscleId[];
  secondaryWorkedMuscles: RecommendationMuscleId[];
  stabilizerWorkedMuscles: RecommendationMuscleId[];
  musclesWorked: RecommendationMuscleId[];
}

function exerciseDurationMinutes(slot: RoutineExercise): number {
  const averageReps = (slot.repsMin + slot.repsMax) / 2;
  const activeSecondsPerSet = averageReps * 4;
  const totalSeconds = slot.sets * (activeSecondsPerSet + slot.restSeconds);
  return totalSeconds / 60;
}

function tokenizeText(value: string): string[] {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function mapUserEquipmentToExerciseEquipment(
  equipment: AIUserContext['athleteProfile']['availableEquipment']
): RecommendationExerciseEquipmentId[] {
  const fullGymEquipment: readonly RecommendationExerciseEquipmentId[] = [
    'barbell',
    'dumbbells',
    'kettlebell',
    'cable_machine',
    'machine',
    'leg_press',
    'hack_squat_machine',
    'smith_machine',
    'treadmill',
    'bench',
    'pec_deck',
    'seated_leg_curl_machine',
    'lying_leg_curl_machine',
    'adductor_machine',
    'abductor_machine',
    'resistance_band',
    'pullup_bar',
    'squat_rack',
    'trx',
    'medicine_ball',
    'foam_roller',
    'mat',
    'box',
    'rings',
    'bike',
    'rowing_machine',
    'bodyweight',
  ];
  const mapped = new Set<RecommendationExerciseEquipmentId>(['bodyweight']);

  for (const item of equipment) {
    switch (item) {
      case 'full_gym':
        fullGymEquipment.forEach((value) => mapped.add(value));
        break;
      case 'barbell':
      case 'dumbbells':
      case 'kettlebell':
      case 'bench':
      case 'smith_machine':
      case 'trx':
      case 'bodyweight':
        mapped.add(item);
        break;
      case 'bodyweight_only':
        mapped.add('bodyweight');
        break;
      case 'resistance_bands':
        mapped.add('resistance_band');
        break;
      case 'cables':
      case 'cable_pulley':
        mapped.add('cable_machine');
        break;
      case 'rack':
        mapped.add('squat_rack');
        break;
      case 'olympic_bar':
      case 'weight_plates':
        mapped.add('barbell');
        break;
      default:
        break;
    }
  }

  return [...mapped];
}

function mapUserGoalToRoutineGoal(
  goal: GoalId | null
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

export function resolveExercises(
  routineTemplate: RoutineTemplate,
  exercises: Exercise[]
): {
  resolvedExercises: RoutineRecommendationResolvedExercise[];
  missingExercises: RoutineRecommendationMissingExercise[];
} {
  const exerciseMap = new Map(
    exercises.map((exercise) => [exercise.id, exercise])
  );
  const resolvedExercises: RoutineRecommendationResolvedExercise[] = [];
  const missingExercises: RoutineRecommendationMissingExercise[] = [];

  for (const day of routineTemplate.days) {
    for (const slot of day.exercises) {
      const exercise = exerciseMap.get(slot.exerciseId);

      if (!exercise) {
        missingExercises.push({
          dayId: day.dayId,
          dayName: day.name,
          slot,
          exerciseId: slot.exerciseId,
        });
        continue;
      }

      resolvedExercises.push({
        dayId: day.dayId,
        dayName: day.name,
        slot,
        exercise,
      });
    }
  }

  return { resolvedExercises, missingExercises };
}

export function calculateRequiredEquipment(
  resolvedExercises: RoutineRecommendationResolvedExercise[]
): RecommendationExerciseEquipmentId[] {
  return unique(
    resolvedExercises.flatMap((item) => item.exercise.requiredEquipment)
  );
}

export function calculateMatchedEquipment(
  userContext: AIUserContext,
  requiredEquipment: RecommendationExerciseEquipmentId[]
): RecommendationExerciseEquipmentId[] {
  const available = new Set(
    mapUserEquipmentToExerciseEquipment(
      userContext.athleteProfile.availableEquipment
    )
  );

  return requiredEquipment.filter((item) => available.has(item));
}

export function calculateMissingEquipment(
  requiredEquipment: RecommendationExerciseEquipmentId[],
  matchedEquipment: RecommendationExerciseEquipmentId[]
): RecommendationExerciseEquipmentId[] {
  const matched = new Set(matchedEquipment);

  return requiredEquipment.filter(
    (item) => item !== 'bodyweight' && !matched.has(item)
  );
}

export function calculateWorkedMusclesByRole(
  resolvedExercises: RoutineRecommendationResolvedExercise[]
): WorkedMusclesByRole {
  const primaryWorkedMuscles = unique(
    resolvedExercises.flatMap((item) => item.exercise.primaryMuscles)
  );
  const secondaryWorkedMuscles = unique(
    resolvedExercises.flatMap((item) => item.exercise.secondaryMuscles)
  );
  const stabilizerWorkedMuscles = unique(
    resolvedExercises.flatMap((item) => item.exercise.stabilizerMuscles)
  );

  return {
    primaryWorkedMuscles,
    secondaryWorkedMuscles,
    stabilizerWorkedMuscles,
    musclesWorked: unique([
      ...primaryWorkedMuscles,
      ...secondaryWorkedMuscles,
      ...stabilizerWorkedMuscles,
    ]),
  };
}

export function calculatePriorityMuscles(
  userContext: AIUserContext,
  primaryWorkedMuscles: RecommendationMuscleId[]
): RecommendationMuscleId[] {
  if (userContext.athleteProfile.priorityMuscles.length === 0) {
    return [];
  }

  const worked = new Set(primaryWorkedMuscles);

  return userContext.athleteProfile.priorityMuscles.filter((muscle) =>
    worked.has(muscle as RecommendationMuscleId)
  ) as RecommendationMuscleId[];
}

export function calculateSessionDuration(
  routineTemplate: RoutineTemplate
): number {
  if (routineTemplate.days.length === 0) return 0;

  const perDayDurations = routineTemplate.days.map((day) =>
    day.exercises.reduce((sum, slot) => sum + exerciseDurationMinutes(slot), 0)
  );

  const averageMinutes =
    perDayDurations.reduce((sum, value) => sum + value, 0) /
    perDayDurations.length;

  return Math.round(averageMinutes);
}

export function calculateWeeklyDays(routineTemplate: RoutineTemplate): number {
  return routineTemplate.days.length || routineTemplate.daysPerWeek;
}

export function isIncompleteRoutineTemplate(input: {
  routineTemplate: RoutineTemplate;
  resolvedExercises: RoutineRecommendationResolvedExercise[];
  totalExercises: number;
}): boolean {
  return (
    input.routineTemplate.days.length === 0 ||
    input.totalExercises === 0 ||
    input.resolvedExercises.length === 0
  );
}

export function detectContraindications(
  userContext: AIUserContext,
  resolvedExercises: RoutineRecommendationResolvedExercise[]
): RoutineRecommendationContraindicatedExercise[] {
  const injuryTokens = tokenizeText(
    userContext.healthRestrictions?.injuryDescription ?? ''
  );
  const diseaseTokens = tokenizeText(
    userContext.healthRestrictions?.diseaseDescription ?? ''
  );
  const avoidMuscles = new Set(userContext.athleteProfile.avoidMuscles);

  return resolvedExercises.flatMap((item) => {
    const reasons: string[] = [];
    const workedMuscles = new Set<RecommendationMuscleId>([
      ...item.exercise.primaryMuscles,
      ...item.exercise.secondaryMuscles,
      ...item.exercise.stabilizerMuscles,
    ]);

    if (
      [...workedMuscles].some((muscle) => avoidMuscles.has(muscle as never))
    ) {
      reasons.push('targets_avoid_muscles');
    }

    for (const contraindication of item.exercise.contraindications) {
      const conditionTokens = tokenizeText(contraindication.condition);
      const matchesInjury = conditionTokens.some((token) =>
        injuryTokens.includes(token)
      );
      const matchesDisease = conditionTokens.some((token) =>
        diseaseTokens.includes(token)
      );

      if (matchesInjury || matchesDisease) {
        reasons.push(`contraindication:${contraindication.condition}`);
      }
    }

    if (reasons.length === 0) {
      return [];
    }

    return [
      {
        dayId: item.dayId,
        dayName: item.dayName,
        exerciseId: item.exercise.id,
        exerciseName: item.exercise.name,
        reasons: unique(reasons),
      },
    ];
  });
}

export function generateWarnings(input: {
  missingExercises: RoutineRecommendationMissingExercise[];
  missingEquipment: RecommendationExerciseEquipmentId[];
  contraindicatedExercises: RoutineRecommendationContraindicatedExercise[];
  compatibleWithSchedule: boolean;
  estimatedSessionDuration: number;
  isIncompleteTemplate: boolean;
  userContext: AIUserContext;
}): string[] {
  const warnings: string[] = [];

  if (input.isIncompleteTemplate) {
    warnings.push('incomplete_routine_template');
  }
  if (input.missingExercises.length > 0) {
    warnings.push('missing_exercises');
  }
  if (input.missingEquipment.length > 0) {
    warnings.push('missing_equipment');
  }
  if (input.contraindicatedExercises.length > 0) {
    warnings.push('contraindications_detected');
  }
  if (!input.compatibleWithSchedule) {
    warnings.push('schedule_mismatch');
  }
  if (
    input.userContext.athleteProfile.sessionDuration != null &&
    input.estimatedSessionDuration >
      input.userContext.athleteProfile.sessionDuration
  ) {
    warnings.push('session_duration_exceeds_preference');
  }

  return warnings;
}

export function resolveRecommendationLocation(
  routineTemplate: RoutineTemplate,
  userContext: AIUserContext
): RecommendationTrainingLocationId {
  if (routineTemplate.trainingLocations.length > 1) {
    return 'hybrid';
  }

  if (
    userContext.athleteProfile.trainingLocation === 'hybrid' &&
    routineTemplate.trainingLocations.length > 0
  ) {
    return routineTemplate.trainingLocations[0];
  }

  return routineTemplate.trainingLocations[0] ?? 'gym';
}

export function resolveRecommendationGoal(
  routineTemplate: RoutineTemplate,
  userContext: AIUserContext
): RecommendationGoalId | null {
  const mappedGoal = mapUserGoalToRoutineGoal(userContext.athleteProfile.goal);

  if (mappedGoal && routineTemplate.goals.includes(mappedGoal)) {
    return mappedGoal;
  }

  return routineTemplate.goals[0] ?? null;
}

export function isCompatibleWithLocation(
  userContext: AIUserContext,
  trainingLocation: RecommendationTrainingLocationId
): boolean {
  const userLocation = userContext.athleteProfile.trainingLocation;

  if (userLocation === 'hybrid') return true;
  if (trainingLocation === 'hybrid') return true;

  return trainingLocation === userLocation;
}

export function isCompatibleWithSchedule(
  userContext: AIUserContext,
  estimatedWeeklyDays: number,
  estimatedSessionDuration: number
): boolean {
  const availableDays = userContext.athleteProfile.availableDays.length;
  const preferredSessionDuration = userContext.athleteProfile.sessionDuration;

  if (availableDays > 0 && estimatedWeeklyDays > availableDays) {
    return false;
  }

  if (
    preferredSessionDuration != null &&
    estimatedSessionDuration > preferredSessionDuration
  ) {
    return false;
  }

  return true;
}
