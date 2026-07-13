import type { RoutineTemplate } from '@admin/routine-builder';
import type { RoutineRecommendationCandidate } from './routine-recommendation-context.model';

export interface RoutineRecommendationReason {
  code: string;
  label: string;
  points: number;
}

export interface RoutineRecommendationPenalty {
  code: string;
  label: string;
  points: number;
}

export interface RoutineRecommendationResult {
  routineId: string;
  routineTemplate: RoutineTemplate;
  score: number;
  normalizedScore: number;
  rank: number;
  reasons: RoutineRecommendationReason[];
  warnings: string[];
  penalties: RoutineRecommendationPenalty[];
  requiredAdaptations: string[];
  candidate: RoutineRecommendationCandidate;
}
