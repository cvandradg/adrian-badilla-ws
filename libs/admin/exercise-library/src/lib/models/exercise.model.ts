import type { Timestamp } from '@angular/fire/firestore';
import type {
  DifficultyId,
  LevelId,
  TrainingLocationId,
  MuscleId,
  EquipmentId,
  BodyRegionId,
  MovementPatternId,
  ExerciseCategoryId,
  ExerciseTypeId,
  GoalId,
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

  /**
   * exerciseCategory — mechanical structure (compound, isolation, functional, olympic).
   */
  exerciseCategory: ExerciseCategoryId | '';

  /**
   * exerciseType — training goal (strength, hypertrophy, mobility, etc.).
   */
  exerciseType: ExerciseTypeId | '';

  difficulty: DifficultyId;
  technicalDifficulty: LevelId;
  riskLevel: LevelId;
  fatigueLevel: LevelId;

  requiredEquipment: EquipmentId[];
  optionalEquipment: EquipmentId[];

  trainingLocations: TrainingLocationId[];

  contraindications: ExerciseContraindication[];

  alternativeExercises: string[];
  goals: GoalId[];
  tags: string[];

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
