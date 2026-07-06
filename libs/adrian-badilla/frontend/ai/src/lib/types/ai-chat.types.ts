// ─── AI Chat Types ────────────────────────────────────────────────────────────
// Union types, enums, and domain-specific interfaces for the AI chat feature.
// Mirrors the Cloud Function request/response contracts.

import type { AiMealSuggestion } from '../models/ai-message.model';

// ── Context sent to the Cloud Function ────────────────────────────────────────

/**
 * Optional context that enriches the AI response.
 * Passed from the component (which knows the user's diet state) to the store,
 * which forwards it to the Cloud Function.
 * The function never calls Angular — this is the only way it gets user state.
 */
export interface AiChatContext {
  /** Remaining macros for today (from settingsStore.remainingMacros). */
  remainingMacros?: { protein: number; carbs: number; fats: number } | null;
  /** ID of the meal the user opened the chat from. */
  activeMealId?: string | null;
}

// ── Response from the Cloud Function ─────────────────────────────────────────

export interface AiChatFunctionResponse {
  content: string;
  mealSuggestion: AiMealSuggestion | null;
}

// ── Pending meal suggestion (from chat → diet tracker integration) ────────────

export interface PendingMealSuggestion {
  mealId: string;
  items: Array<{ name: string; protein: number; carbs: number; fats: number }>;
  totals: { protein: number; carbs: number; fats: number };
}

// ── Call state (mirrored from billing lib pattern) ────────────────────────────

export type AiCallState = 'idle' | 'loading' | 'success' | 'error';
