import type { Timestamp } from 'firebase/firestore';
import type { RoutineTemplate } from '@admin/routine-builder';
import type {
  RoutineRecommendationPenalty,
  RoutineRecommendationReason,
} from './routine-recommendation-result.model';

export type AssignedRoutineStatus = 'active' | 'inactive';
export type AssignedRoutineSource = 'recommendation_engine';
export type AssignedRoutineExerciseStatus = 'pending' | 'completed' | 'skipped';

export interface AssignedRoutineExercise {
  id: string;
  originalExerciseId: string;
  exerciseId: string;
  nameSnapshot: string;
  thumbnailUrlSnapshot: string;
  order: number;
  sets: number;
  repsMin: number;
  repsMax: number;
  restSeconds: number;
  rir: number;
  tempo: string;
  notes: string;
  status: AssignedRoutineExerciseStatus;
}

export interface AssignedRoutineDay {
  id: string;
  dayId: string;
  dayName: string;
  order: number;
  estimatedDuration: number;
  exerciseCount: number;
  exercises: AssignedRoutineExercise[];
}

export interface AssignedRoutine {
  id: string;
  userId: string;
  routineTemplateId: string;
  source: AssignedRoutineSource;
  recommendationScore: number;
  normalizedScore: number;
  recommendationReasons: RoutineRecommendationReason[];
  warnings: string[];
  penalties: RoutineRecommendationPenalty[];
  requiredAdaptations: string[];
  status: AssignedRoutineStatus;
  assignedAt: Timestamp;
  startedAt: Timestamp | null;
  completedAt: Timestamp | null;
  templateSnapshot: RoutineTemplate;
  days: AssignedRoutineDay[];
  updatedAt: Timestamp;
  deactivatedAt?: Timestamp | null;
}

export interface AssignedRoutineCreatePayload {
  userId: string;
  routineTemplateId: string;
  source: AssignedRoutineSource;
  recommendationScore: number;
  normalizedScore: number;
  recommendationReasons: RoutineRecommendationReason[];
  warnings: string[];
  penalties: RoutineRecommendationPenalty[];
  requiredAdaptations: string[];
  status: AssignedRoutineStatus;
  assignedAt: unknown;
  startedAt: null;
  completedAt: null;
  templateSnapshot: RoutineTemplate;
  updatedAt: unknown;
  deactivatedAt?: unknown | null;
}

export interface AssignedRoutineDayCreatePayload {
  dayId: string;
  dayName: string;
  order: number;
  estimatedDuration: number;
  exerciseCount: number;
}

export interface AssignedRoutineExerciseCreatePayload {
  originalExerciseId: string;
  exerciseId: string;
  nameSnapshot: string;
  thumbnailUrlSnapshot: string;
  order: number;
  sets: number;
  repsMin: number;
  repsMax: number;
  restSeconds: number;
  rir: number;
  tempo: string;
  notes: string;
  status: AssignedRoutineExerciseStatus;
}
