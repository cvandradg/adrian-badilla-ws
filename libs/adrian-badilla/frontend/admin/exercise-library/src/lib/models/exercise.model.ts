import type { Timestamp } from '@angular/fire/firestore';
import type {
  LevelId,
  TrainingLocationId,
  MuscleId,
  EquipmentId,
  BodyRegionId,
  MovementPatternId,
  MovementPlaneId,
  ExerciseCategoryId,
  ExerciseTypeId,
  GoalId,
  ExerciseTagId,
  ContraindicationSeverityId,
} from '../shared/catalogs';

// ─── Contraindication ────────────────────────────────────────────────────────

export interface ExerciseContraindication {
  condition: string;
  severity: ContraindicationSeverityId;
  reason: string;
}

// ─── Exercise ────────────────────────────────────────────────────────────────

export interface Exercise {
  id: string;

  name: string;
  description: string;

  instructions: string[];
  tips: string[];
  commonMistakes: string[];

  primaryMuscles: MuscleId[];
  secondaryMuscles: MuscleId[];
  stabilizerMuscles: MuscleId[];

  bodyRegion: BodyRegionId | '';
  movementPattern: MovementPatternId | '';
  movementPlane: MovementPlaneId | '';

  /**
   * exerciseCategory — mechanical structure (compound, isolation, functional, olympic).
   */
  exerciseCategory: ExerciseCategoryId | '';

  /**
   * exerciseType — training goal (strength, hypertrophy, mobility, etc.).
   */
  exerciseType: ExerciseTypeId | '';

  technicalDifficulty: LevelId;
  riskLevel: LevelId;
  fatigueLevel: LevelId;

  requiredEquipment: EquipmentId[];
  optionalEquipment: EquipmentId[];

  trainingLocations: TrainingLocationId[];

  contraindications: ExerciseContraindication[];

  alternativeExerciseIds: string[];
  goals: GoalId[];
  tags: ExerciseTagId[];

  videoUrl: string;
  thumbnailUrl: string;

  isCompound: boolean;
  isUnilateral: boolean;
  isBodyweight: boolean;
  isActive: boolean;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Form types ──────────────────────────────────────────────────────────────

export type ExerciseCreatePayload = Omit<
  Exercise,
  'id' | 'createdAt' | 'updatedAt'
>;
export type ExerciseUpdatePayload = Partial<ExerciseCreatePayload>;

export interface LegacyExerciseSource {
  difficulty?: string;
  alternativeExercises?: string[] | string | null;
}
