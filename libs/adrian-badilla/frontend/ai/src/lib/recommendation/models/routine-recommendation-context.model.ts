import type { Exercise } from '@admin/exercise-library';
import type { RoutineExercise, RoutineTemplate } from '@admin/routine-builder';
import type { AIUserContext } from '../../context/models/ai-user-context.model';

export type RecommendationExerciseEquipmentId =
  Exercise['requiredEquipment'][number];
export type RecommendationMuscleId = Exercise['primaryMuscles'][number];
export type RecommendationTrainingLocationId =
  | Exercise['trainingLocations'][number]
  | 'hybrid';
export type RecommendationGoalId = RoutineTemplate['goals'][number];

export interface RoutineRecommendationResolvedExercise {
  dayId: string;
  dayName: string;
  slot: RoutineExercise;
  exercise: Exercise;
}

export interface RoutineRecommendationMissingExercise {
  dayId: string;
  dayName: string;
  slot: RoutineExercise;
  exerciseId: string;
}

export interface RoutineRecommendationContraindicatedExercise {
  dayId: string;
  dayName: string;
  exerciseId: string;
  exerciseName: string;
  reasons: string[];
}

export interface RoutineRecommendationMetadata {
  totalExercises: number;
  resolvedExerciseCount: number;
  missingExerciseCount: number;
  contraindicationCount: number;
  locationMatched: boolean;
  equipmentMatchedCount: number;
  missingEquipmentCount: number;
  userGoalMatched: boolean;
}

export interface RoutineRecommendationCandidate {
  id: string;
  routineTemplate: RoutineTemplate;
  isIncompleteTemplate: boolean;
  resolvedExercises: RoutineRecommendationResolvedExercise[];
  missingExercises: RoutineRecommendationMissingExercise[];
  estimatedSessionDuration: number;
  estimatedWeeklyDays: number;
  goal: RecommendationGoalId | null;
  trainingLocation: RecommendationTrainingLocationId;
  requiredEquipment: RecommendationExerciseEquipmentId[];
  matchedEquipment: RecommendationExerciseEquipmentId[];
  missingEquipment: RecommendationExerciseEquipmentId[];
  primaryWorkedMuscles: RecommendationMuscleId[];
  secondaryWorkedMuscles: RecommendationMuscleId[];
  stabilizerWorkedMuscles: RecommendationMuscleId[];
  musclesWorked: RecommendationMuscleId[];
  priorityMusclesWorked: RecommendationMuscleId[];
  contraindicatedExercises: RoutineRecommendationContraindicatedExercise[];
  compatibleWithEquipment: boolean;
  compatibleWithLocation: boolean;
  compatibleWithSchedule: boolean;
  warnings: string[];
  metadata: RoutineRecommendationMetadata;
}

export interface RoutineRecommendationContext {
  userContext: AIUserContext;
  candidates: RoutineRecommendationCandidate[];
}
