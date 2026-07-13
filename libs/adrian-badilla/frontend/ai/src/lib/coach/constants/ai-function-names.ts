// ─── AI Cloud Function Names ──────────────────────────────────────────────────
// Centralized constants for all AI Firebase Callable Function names.
// Change once here — all services update automatically.
// Matches the exported function names in functions/src/index.ts.

export const AI_FUNCTION_NAMES = {
  CHAT: 'aiChat',
  COACH: 'aiCoach',
  ASSESSMENT: 'aiAssessment',
  RECOMMENDATION: 'aiRecommendation',
  MEMORY: 'aiMemory',
  NUTRITION: 'aiNutrition',
  ROUTINE: 'aiRoutine',
} as const;

export type AiFunctionName = (typeof AI_FUNCTION_NAMES)[keyof typeof AI_FUNCTION_NAMES];
