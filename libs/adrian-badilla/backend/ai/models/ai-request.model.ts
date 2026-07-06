// ─── Backend AI Request Models ─────────────────────────────────────────────────
// Shared TypeScript interfaces documenting the Cloud Function request payloads.
// These are the contracts between Angular and the Firebase Functions.
// Mirrored in the frontend AI lib types for type safety end-to-end.

export interface AiChatRequest {
  message: string;
  context?: {
    remainingMacros?: { protein: number; carbs: number; fats: number } | null;
    activeMealId?: string | null;
  };
}

export interface AiCoachRequest {
  question: string;
  context?: {
    coachFocus?: string;
    recentProgress?: string;
  };
}

export interface AiAssessmentRequest {
  answers: Record<string, string>;
}

export interface AiRecommendationRequest {
  userId: string;
}

export interface AiMemoryRequest {
  action: 'save' | 'retrieve';
  summary?: string;
}

export interface AiNutritionRequest {
  preferences: {
    goal: 'weight_loss' | 'muscle_gain' | 'maintenance';
    restrictions?: string[];
    macroTargets?: { protein: number; carbs: number; fats: number };
  };
}

export interface AiRoutineRequest {
  preferences: {
    goal: 'strength' | 'endurance' | 'mobility' | 'weight_loss';
    daysPerWeek: number;
    level: 'beginner' | 'intermediate' | 'advanced';
    restrictions?: string[];
  };
}
