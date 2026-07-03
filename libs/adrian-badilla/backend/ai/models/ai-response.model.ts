// ─── Backend AI Response Models ────────────────────────────────────────────────
// Shared TypeScript interfaces documenting the Cloud Function response payloads.
// These are the contracts returned from Firebase Functions to Angular.
// Mirrored in the frontend AI lib types for type safety end-to-end.

export interface AiMealSuggestion {
  items: Array<{ name: string; protein: number; carbs: number; fats: number }>;
  totals: { protein: number; carbs: number; fats: number };
}

export interface AiChatResponse {
  content: string;
  mealSuggestion: AiMealSuggestion | null;
}

export interface AiCoachResponse {
  content: string;
}

export interface AiAssessmentResponse {
  analysis: string;
  score: number;
  recommendations: string[];
}

export interface AiRecommendationResponse {
  recommendations: Array<{
    type: string;
    title: string;
    body: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  riskAlerts: Array<{
    riskType: string;
    severity: 'warning' | 'critical';
    message: string;
  }>;
}

export interface AiNutritionResponse {
  planName: string;
  rationale: string;
  days: Array<{
    dayName: string;
    meals: Array<{
      mealType: string;
      foods: string[];
      macros: { protein: number; carbs: number; fats: number };
    }>;
  }>;
}

export interface AiRoutineResponse {
  routineName: string;
  rationale: string;
  days: Array<{
    dayName: string;
    focus: string;
    exercises: Array<{
      name: string;
      sets: number;
      reps: string;
      rest: string;
    }>;
  }>;
}
