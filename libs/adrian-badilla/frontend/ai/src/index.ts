// ─── Public API ───────────────────────────────────────────────────────────────
// @adrian-badilla/ai — AI Coach library public surface.
// Only exports that are intentionally public belong here.

// ── Store ─────────────────────────────────────────────────────────────────────
export { aiStore } from './lib/store/ai.store';
export type { AiStore } from './lib/store/ai.store';

// ── Components ────────────────────────────────────────────────────────────────
export { AiCoachChatComponent } from './lib/components/ai-coach-chat/ai-coach-chat.component';

// ── Models ────────────────────────────────────────────────────────────────────
export type { AiMessage, AiMealSuggestion } from './lib/models/ai-message.model';
export type {
  AiConversation,
  AiConversationMessage,
  AiConversationContext,
  AiConversationSummary,
  AiConversationMetadata,
} from './lib/models/ai-conversation.model';

// ── Types ─────────────────────────────────────────────────────────────────────
export type {
  AiChatContext,
  AiChatFunctionResponse,
  PendingMealSuggestion,
} from './lib/types/ai-chat.types';

// ── Constants ─────────────────────────────────────────────────────────────────
export { AI_FUNCTION_NAMES } from './lib/constants/ai-function-names';
export { aiFirestorePaths } from './lib/constants/ai-firestore-paths';
