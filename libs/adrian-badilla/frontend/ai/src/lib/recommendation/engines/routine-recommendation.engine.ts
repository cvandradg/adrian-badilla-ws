import type { RoutineRecommendationContext } from '../models/routine-recommendation-context.model';
import type { RoutineRecommendationResult } from '../models/routine-recommendation-result.model';
import {
  evaluateRoutineRecommendationCandidate,
  normalizeRoutineRecommendationScore,
} from './routine-recommendation-rules';

function compareResults(
  left: RoutineRecommendationResult,
  right: RoutineRecommendationResult
): number {
  if (right.score !== left.score) {
    return right.score - left.score;
  }

  if (right.normalizedScore !== left.normalizedScore) {
    return right.normalizedScore - left.normalizedScore;
  }

  return left.routineId.localeCompare(right.routineId);
}

export class RoutineRecommendationEngine {
  run(context: RoutineRecommendationContext): RoutineRecommendationResult[] {
    const scored = context.candidates.map((candidate) => {
      const evaluation = evaluateRoutineRecommendationCandidate(
        context.userContext,
        candidate
      );

      return {
        routineId: candidate.routineTemplate.id,
        routineTemplate: candidate.routineTemplate,
        score: evaluation.score,
        normalizedScore: normalizeRoutineRecommendationScore(evaluation.score),
        rank: 0,
        reasons: evaluation.reasons,
        warnings: candidate.warnings,
        penalties: evaluation.penalties,
        requiredAdaptations: evaluation.requiredAdaptations,
        candidate,
      } satisfies RoutineRecommendationResult;
    });

    const sorted = [...scored].sort(compareResults);

    return sorted.map((result, index) => ({
      ...result,
      rank: index + 1,
    }));
  }
}
