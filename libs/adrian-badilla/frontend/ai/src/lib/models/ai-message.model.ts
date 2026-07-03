// ─── AI Message Model ─────────────────────────────────────────────────────────
// Domain model for a single message in a coach/chat conversation.

export interface AiMessage {
  /** Client-generated UUID (crypto.randomUUID). */
  id: string;
  role: 'user' | 'assistant';
  content: string;
  /** Unix timestamp in milliseconds. */
  timestamp: number;
}

export interface AiMealSuggestion {
  items: Array<{ name: string; protein: number; carbs: number; fats: number }>;
  totals: { protein: number; carbs: number; fats: number };
}
