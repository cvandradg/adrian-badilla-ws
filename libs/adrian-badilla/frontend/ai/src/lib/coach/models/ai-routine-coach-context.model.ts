import type { Exercise } from '@admin/exercise-library';
import type {
  AIAthleteProfile,
  AIHealthProfile,
  AIHealthRestrictions,
  AINutritionProfile,
  AIUserContext,
} from '../../context/models/ai-user-context.model';
import type {
  RoutineRecommendationPenalty,
  RoutineRecommendationReason,
  RoutineRecommendationResult,
} from '../../recommendation/models/routine-recommendation-result.model';

export interface AIRoutineCoachScoreBreakdownItem {
  type: 'reason' | 'penalty' | 'warning' | 'adaptation';
  code: string;
  label: string;
  points: number;
}

export interface AIRoutineCoachUserSummary {
  userId: string;
  displayName: string;
}

export interface AIAvailableExerciseAlternative {
  exerciseId: string;
  name: string;
  primaryMuscles: Exercise['primaryMuscles'];
  secondaryMuscles: Exercise['secondaryMuscles'];
  bodyRegion: Exercise['bodyRegion'];
  movementPattern: Exercise['movementPattern'];
  goals: Exercise['goals'];
  requiredEquipment: Exercise['requiredEquipment'];
  trainingLocations: Exercise['trainingLocations'];
  reason: string;
  matchReasons: string[];
}

export interface AIRoutineCoachContext {
  user: AIRoutineCoachUserSummary;
  athleteProfile: AIAthleteProfile;
  nutritionProfile: AINutritionProfile;
  health: {
    healthProfile: AIHealthProfile;
    healthRestrictions: AIHealthRestrictions;
  };
  recommendedRoutine: RoutineRecommendationResult;
  scoreBreakdown: AIRoutineCoachScoreBreakdownItem[];
  recommendationReasons: RoutineRecommendationReason[];
  penalties: RoutineRecommendationPenalty[];
  warnings: string[];
  availableExerciseAlternatives: AIAvailableExerciseAlternative[];
  availableEquipment: string[];
  trainingLocation: string | null;
  availableDays: string[];
  priorityMuscles: string[];
  secondaryGoal: string | null;
  currentWeight: number | null;
  height: number | null;
  age: number | null;
  sex: string | null;
  experience: string | null;
  preferredSessionDuration: number | null;
}

export interface AIRoutineCoachContextBuildInput {
  userContext: AIUserContext;
  recommendedRoutine: RoutineRecommendationResult;
  exerciseLibrary?: Exercise[];
}
