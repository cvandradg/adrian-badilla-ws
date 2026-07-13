// ─── Public API ───────────────────────────────────────────────────────────────
// @adrian-badilla/ai — AI Coach library public surface.
// Only exports that are intentionally public belong here.

// ── Store ─────────────────────────────────────────────────────────────────────
export { aiStore } from './lib/coach/store/ai.store';
export type { AiStore } from './lib/coach/store/ai.store';

// ── Components ────────────────────────────────────────────────────────────────
export { AiCoachChatComponent } from './lib/coach/components/ai-coach-chat/ai-coach-chat.component';

// ── Models ────────────────────────────────────────────────────────────────────
export type {
  AiMessage,
  AiMealSuggestion,
} from './lib/coach/models/ai-message.model';
export type {
  AIAvailableExerciseAlternative,
  AIRoutineCoachContext,
  AIRoutineCoachContextBuildInput,
  AIRoutineCoachScoreBreakdownItem,
  AIRoutineCoachUserSummary,
} from './lib/coach/models/ai-routine-coach-context.model';
export type {
  AIRoutineCoachAppliedExerciseChange,
  AIRoutineCoachAppliedResult,
  AIRoutineCoachAppliedVolumeChange,
  AIRoutineCoachRejectedChange,
} from './lib/coach/appliers/ai-routine-coach-response.applier';
export type {
  AiConversation,
  AiConversationMessage,
  AiConversationContext,
  AiConversationSummary,
  AiConversationMetadata,
} from './lib/coach/models/ai-conversation.model';

// ── Types ─────────────────────────────────────────────────────────────────────
export type {
  AiChatContext,
  AiChatFunctionResponse,
  PendingMealSuggestion,
} from './lib/coach/types/ai-chat.types';
export type {
  AIRoutineCoachEquipmentChange,
  AIRoutineCoachExerciseChange,
  AIRoutineCoachResponse,
  AIRoutineCoachValidationResult,
  AIRoutineCoachVolumeChange,
} from './lib/coach/models/ai-routine-coach-response.model';

export type {
  AIContextReadiness,
  AIHealthProfile,
  AIHealthRestrictions,
  HealthRestrictions,
  AIMetrics,
  AINutritionProfile,
  AIPreferences,
  AIAthleteProfile,
  AIUserContext,
  AIUserContextSource,
} from './lib/context/models/ai-user-context.model';

export type {
  HealthRestrictions as StructuredHealthRestrictions,
  Injury,
  InjurySeverityId,
  MedicalCondition,
  RestrictedMovementPatternId,
} from './lib/context/models/health-restrictions.model';

export type {
  CanonicalCatalogItem,
  EquipmentId,
  GoalId,
  InjuryAreaId,
  MealScheduleId,
  MedicalConditionId,
  MuscleId,
  PreferredScheduleId,
  SecondaryGoalId,
  SeverityId,
  SportId,
  TrainingConsistencyId,
  TrainingExperienceId,
  TrainingLocationId,
  TrainingStylePreferenceId,
  TrainingTypeId,
  WeekDayId,
} from './lib/shared/catalogs/athlete-profile.catalogs';

export {
  EQUIPMENT_CATALOG,
  GOAL_CATALOG,
  INJURY_AREA_CATALOG,
  MEAL_SCHEDULE_CATALOG,
  MEDICAL_CONDITION_CATALOG,
  MUSCLE_CATALOG,
  PREFERRED_SCHEDULE_CATALOG,
  SECONDARY_GOAL_CATALOG,
  SEVERITY_CATALOG,
  SPORT_CATALOG,
  TRAINING_CONSISTENCY_CATALOG,
  TRAINING_EXPERIENCE_CATALOG,
  TRAINING_LOCATION_CATALOG,
  TRAINING_STYLE_PREFERENCE_CATALOG,
  TRAINING_TYPE_CATALOG,
  WEEK_DAY_CATALOG,
} from './lib/shared/catalogs/athlete-profile.catalogs';

export {
  normalizeAthleteProfile,
  normalizeAthleteProfileFormData,
  normalizeEquipment,
  normalizeGoal,
  normalizeMealScheduleItem,
  normalizeMuscle,
  normalizePreferredSchedule,
  normalizeSeverity,
  normalizeSport,
  normalizeTrainingConsistency,
  normalizeTrainingExperience,
  normalizeTrainingLocation,
  normalizeTrainingStylePreference,
  normalizeTrainingType,
  normalizeWeekDay,
} from './lib/context/mappers/athlete-profile-normalizer';

export type {
  NormalizedAthleteProfile,
  NormalizedAthleteProfileFormData,
} from './lib/context/mappers/athlete-profile-normalizer';

export {
  calculateBmi,
  calculateBmiCategory,
  calculateBmiScore,
  calculateCalorieEstimate,
  calculateFatMass,
  calculateIdealWeight,
  calculateLeanBodyMass,
  calculateTrainingAgeCategory,
} from './lib/context/calculators/ai-metrics.calculators';

export {
  isAthleteProfileComplete,
  isDietRecommendationReady,
  isHealthProfileComplete,
  isNutritionProfileComplete,
  isWorkoutRecommendationReady,
} from './lib/context/validators/ai-context-readiness.validators';

export { AIUserContextBuilder } from './lib/context/builders/ai-user-context.builder';
export { AIRoutineCoachContextBuilder } from './lib/coach/builders/ai-routine-coach-context.builder';
export { AIRoutineCoachPromptBuilder } from './lib/coach/builders/ai-routine-coach-prompt.builder';
export { findAvailableExerciseAlternatives } from './lib/coach/helpers/available-exercise-alternatives.helper';
export {
  AIRoutineCoachResponseApplier,
} from './lib/coach/appliers/ai-routine-coach-response.applier';
export { AIRoutineCoachResponseValidator } from './lib/coach/validators/ai-routine-coach-response.validator';
export { AIRoutineCoachFacade } from './lib/coach/facades/ai-routine-coach.facade';
export { AI_ROUTINE_COACH_RESPONSE_SCHEMA } from './lib/coach/schemas/ai-routine-coach-response.schema';

export type {
  AssignedRoutine,
  AssignedRoutineCreatePayload,
  AssignedRoutineDay,
  AssignedRoutineDayCreatePayload,
  AssignedRoutineExercise,
  AssignedRoutineExerciseCreatePayload,
  AssignedRoutineExerciseStatus,
  AssignedRoutineSource,
  AssignedRoutineStatus,
} from './lib/recommendation/models/assigned-routine.model';

export type {
  RecommendationExerciseEquipmentId,
  RecommendationGoalId,
  RecommendationMuscleId,
  RecommendationTrainingLocationId,
  RoutineRecommendationCandidate,
  RoutineRecommendationContext,
  RoutineRecommendationContraindicatedExercise,
  RoutineRecommendationMetadata,
  RoutineRecommendationMissingExercise,
  RoutineRecommendationResolvedExercise,
} from './lib/recommendation/models/routine-recommendation-context.model';

export type {
  RoutineRecommendationPenalty,
  RoutineRecommendationReason,
  RoutineRecommendationResult,
} from './lib/recommendation/models/routine-recommendation-result.model';

export {
  calculateMatchedEquipment as calculateRoutineRecommendationMatchedEquipment,
  calculatePriorityMuscles as calculateRoutineRecommendationPriorityMuscles,
  calculateRequiredEquipment as calculateRoutineRecommendationRequiredEquipment,
  calculateSessionDuration as calculateRoutineRecommendationSessionDuration,
  calculateWeeklyDays as calculateRoutineRecommendationWeeklyDays,
  calculateWorkedMusclesByRole as calculateRoutineRecommendationWorkedMusclesByRole,
  detectContraindications as detectRoutineRecommendationContraindications,
  generateWarnings as generateRoutineRecommendationWarnings,
  isCompatibleWithLocation as isRoutineRecommendationCompatibleWithLocation,
  isCompatibleWithSchedule as isRoutineRecommendationCompatibleWithSchedule,
  resolveExercises as resolveRoutineRecommendationExercises,
  resolveRecommendationGoal as resolveRoutineRecommendationGoal,
  resolveRecommendationLocation as resolveRoutineRecommendationLocation,
} from './lib/recommendation/helpers/routine-recommendation.helpers';

export {
  ROUTINE_RECOMMENDATION_SCORE_RANGE,
  ROUTINE_RECOMMENDATION_SCORE_RULES,
  applyHealthRestrictions,
  calculatePriorityMuscleCoverage,
  detectRestrictedMovementPatterns,
  evaluateHealthRestrictions,
  evaluateRoutineRecommendationCandidate,
  isExcessiveDuration as isRoutineRecommendationExcessiveDuration,
  isGoalMatch as isRoutineRecommendationGoalMatch,
  isScheduleMatch as isRoutineRecommendationScheduleMatch,
  isSessionDurationMatch as isRoutineRecommendationSessionDurationMatch,
  normalizeRoutineRecommendationScore,
} from './lib/recommendation/engines/routine-recommendation-rules';

export { RoutineRecommendationContextBuilder } from './lib/recommendation/builders/routine-recommendation-context.builder';
export { RoutineRecommendationEngine } from './lib/recommendation/engines/routine-recommendation.engine';
export { RoutineRecommendationFacade } from './lib/recommendation/facades/routine-recommendation.facade';
export { AssignedRoutineRepository } from './lib/recommendation/repositories/assigned-routine.repository';
export { AssignedRoutineFacade } from './lib/recommendation/facades/assigned-routine.facade';

// ── Constants ─────────────────────────────────────────────────────────────────
export { AI_FUNCTION_NAMES } from './lib/coach/constants/ai-function-names';
export { aiFirestorePaths } from './lib/coach/constants/ai-firestore-paths';
