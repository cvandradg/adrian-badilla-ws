import type { Exercise } from '@admin/exercise-library';
import type {
  EquipmentId,
  MuscleId,
  TrainingLocationId,
} from '../../shared/catalogs/athlete-profile.catalogs';
import type {
  RecommendationExerciseEquipmentId,
  RecommendationMuscleId,
  RoutineRecommendationResolvedExercise,
} from '../../recommendation/models/routine-recommendation-context.model';
import type { AIAvailableExerciseAlternative } from '../models/ai-routine-coach-context.model';

export interface FindAvailableExerciseAlternativesParams {
  userAvailableEquipment: EquipmentId[];
  userTrainingLocation: TrainingLocationId | null;
  userPriorityMuscles?: MuscleId[];
  missingEquipment: RecommendationExerciseEquipmentId[];
  resolvedExercises: RoutineRecommendationResolvedExercise[];
  exerciseLibrary?: Exercise[];
}

const FULL_GYM_EQUIPMENT: readonly RecommendationExerciseEquipmentId[] = [
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

interface AlternativeTargetProfile {
  primaryMuscles: Set<RecommendationMuscleId>;
  movementPatterns: Set<Exercise['movementPattern']>;
  bodyRegions: Set<Exercise['bodyRegion']>;
  goals: Set<Exercise['goals'][number]>;
}

interface RankedAlternative {
  alternative: AIAvailableExerciseAlternative;
  score: number;
  samePrimaryMuscle: boolean;
  sameMovementPattern: boolean;
  sameBodyRegion: boolean;
}

function unique<T>(values: readonly T[]): T[] {
  return [...new Set(values)];
}

function mapUserEquipmentToExerciseEquipment(
  equipment: EquipmentId[]
): RecommendationExerciseEquipmentId[] {
  const mapped = new Set<RecommendationExerciseEquipmentId>(['bodyweight']);

  for (const item of equipment) {
    switch (item) {
      case 'full_gym':
        FULL_GYM_EQUIPMENT.forEach((value) => mapped.add(value));
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

function isCompatibleWithLocation(
  userTrainingLocation: TrainingLocationId | null,
  exerciseLocations: Exercise['trainingLocations']
): boolean {
  if (userTrainingLocation == null || userTrainingLocation === 'hybrid') {
    return true;
  }

  if (exerciseLocations.length === 0) {
    return true;
  }

  return exerciseLocations.includes(
    userTrainingLocation as Exercise['trainingLocations'][number]
  );
}

function getAffectedResolvedExercises(
  resolvedExercises: RoutineRecommendationResolvedExercise[],
  missingEquipment: RecommendationExerciseEquipmentId[]
): RoutineRecommendationResolvedExercise[] {
  if (missingEquipment.length === 0) {
    return resolvedExercises;
  }

  const missing = new Set(missingEquipment);

  return resolvedExercises.filter((item) =>
    item.exercise.requiredEquipment.some((equipment) => missing.has(equipment))
  );
}

function buildTargetProfile(
  resolvedExercises: RoutineRecommendationResolvedExercise[]
): AlternativeTargetProfile {
  const sourceExercises =
    resolvedExercises.length > 0
      ? resolvedExercises.map((item) => item.exercise)
      : [];

  return {
    primaryMuscles: new Set(
      unique(
        sourceExercises.flatMap((exercise) => exercise.primaryMuscles)
      ) as RecommendationMuscleId[]
    ),
    movementPatterns: new Set(
      unique(
        sourceExercises
          .map((exercise) => exercise.movementPattern)
          .filter(Boolean)
      ) as Exercise['movementPattern'][]
    ),
    bodyRegions: new Set(
      unique(
        sourceExercises.map((exercise) => exercise.bodyRegion).filter(Boolean)
      ) as Exercise['bodyRegion'][]
    ),
    goals: new Set(
      unique(sourceExercises.flatMap((exercise) => exercise.goals))
    ),
  };
}

function intersects<T>(left: readonly T[], right: Set<T>): boolean {
  return left.some((item) => right.has(item));
}

function buildMatchReasons(params: {
  exercise: Exercise;
  targetProfile: AlternativeTargetProfile;
  priorityMuscles: Set<MuscleId>;
}): string[] {
  const matchReasons = ['compatible_equipment', 'compatible_location'];

  if (intersects(params.exercise.primaryMuscles, params.targetProfile.primaryMuscles)) {
    matchReasons.push('same_primary_muscle');
  }

  if (
    params.exercise.movementPattern &&
    params.targetProfile.movementPatterns.has(params.exercise.movementPattern)
  ) {
    matchReasons.push('same_movement_pattern');
  }

  if (
    params.exercise.bodyRegion &&
    params.targetProfile.bodyRegions.has(params.exercise.bodyRegion)
  ) {
    matchReasons.push('same_body_region');
  }

  if (intersects(params.exercise.primaryMuscles, params.priorityMuscles)) {
    matchReasons.push('priority_user_muscle');
  }

  if (intersects(params.exercise.goals, params.targetProfile.goals)) {
    matchReasons.push('shared_goal');
  }

  return matchReasons;
}

function scoreAlternative(matchReasons: string[]): number {
  const reasons = new Set(matchReasons);

  let score = 0;

  if (reasons.has('compatible_equipment')) score += 1_000_000;
  if (reasons.has('compatible_location')) score += 500_000;
  if (reasons.has('same_primary_muscle')) score += 100_000;
  if (reasons.has('same_movement_pattern')) score += 10_000;
  if (reasons.has('same_body_region')) score += 1_000;
  if (reasons.has('priority_user_muscle')) score += 100;
  if (reasons.has('shared_goal')) score += 10;

  return score;
}

function buildReason(matchReasons: string[]): string {
  if (matchReasons.includes('same_primary_muscle')) {
    return 'same_primary_muscle_match';
  }

  if (matchReasons.includes('same_movement_pattern')) {
    return 'same_movement_pattern_match';
  }

  if (matchReasons.includes('same_body_region')) {
    return 'same_body_region_match';
  }

  return 'compatible_exercise_match';
}

function compareAlternatives(left: RankedAlternative, right: RankedAlternative): number {
  if (right.samePrimaryMuscle !== left.samePrimaryMuscle) {
    return Number(right.samePrimaryMuscle) - Number(left.samePrimaryMuscle);
  }

  if (right.sameMovementPattern !== left.sameMovementPattern) {
    return Number(right.sameMovementPattern) - Number(left.sameMovementPattern);
  }

  if (right.sameBodyRegion !== left.sameBodyRegion) {
    return Number(right.sameBodyRegion) - Number(left.sameBodyRegion);
  }

  if (right.score !== left.score) {
    return right.score - left.score;
  }

  const nameComparison = left.alternative.name.localeCompare(right.alternative.name);

  if (nameComparison !== 0) {
    return nameComparison;
  }

  return left.alternative.exerciseId.localeCompare(right.alternative.exerciseId);
}

export function findAvailableExerciseAlternatives(
  params: FindAvailableExerciseAlternativesParams
): AIAvailableExerciseAlternative[] {
  const exerciseLibrary = params.exerciseLibrary ?? [];

  if (exerciseLibrary.length === 0) {
    return [];
  }

  const usedExerciseIds = new Set(
    params.resolvedExercises.map((item) => item.exercise.id)
  );
  const availableEquipment = new Set(
    mapUserEquipmentToExerciseEquipment(params.userAvailableEquipment)
  );
  const affectedResolvedExercises = getAffectedResolvedExercises(
    params.resolvedExercises,
    params.missingEquipment
  );
  const targetProfile = buildTargetProfile(affectedResolvedExercises);
  const priorityMuscles = new Set(params.userPriorityMuscles ?? []);

  return exerciseLibrary
    .filter((exercise) => exercise.isActive)
    .filter((exercise) => !usedExerciseIds.has(exercise.id))
    .filter((exercise) =>
      exercise.requiredEquipment.every((equipment) =>
        availableEquipment.has(equipment)
      )
    )
    .filter((exercise) =>
      isCompatibleWithLocation(params.userTrainingLocation, exercise.trainingLocations)
    )
    .map((exercise) => {
      const matchReasons = buildMatchReasons({
        exercise,
        targetProfile,
        priorityMuscles,
      });

      return {
        alternative: {
          exerciseId: exercise.id,
          name: exercise.name,
          primaryMuscles: exercise.primaryMuscles,
          secondaryMuscles: exercise.secondaryMuscles,
          bodyRegion: exercise.bodyRegion,
          movementPattern: exercise.movementPattern,
          goals: exercise.goals,
          requiredEquipment: exercise.requiredEquipment,
          trainingLocations: exercise.trainingLocations,
          reason: buildReason(matchReasons),
          matchReasons,
        },
        score: scoreAlternative(matchReasons),
        samePrimaryMuscle: matchReasons.includes('same_primary_muscle'),
        sameMovementPattern: matchReasons.includes('same_movement_pattern'),
        sameBodyRegion: matchReasons.includes('same_body_region'),
      } satisfies RankedAlternative;
    })
    .sort(compareAlternatives)
    .map((item) => item.alternative);
}
