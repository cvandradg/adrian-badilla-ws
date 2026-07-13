// ─── AI Conversation Model ────────────────────────────────────────────────────
// Domain models for conversation history and memory.
// Prepared for future conversational memory feature — not yet persisted.

import type { Timestamp } from 'firebase/firestore';

/** Types of AI conversation sessions. */
export type AiConversationType =
  | 'chat'
  | 'coach'
  | 'assessment'
  | 'weekly_checkin';

/** A persisted conversation metadata record in Firestore. */
export interface AiConversation {
  id: string;
  userId: string;
  type: AiConversationType;
  title: string;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date;
}

/** A single persisted message in a conversation (Firestore shape). */
export interface AiConversationMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/** Context snapshot attached to a conversation for AI continuity. */
export interface AiConversationContext {
  remainingMacros?: { protein: number; carbs: number; fats: number };
  activeDietId?: string;
  activeRoutineId?: string;
}

/** AI-generated summary of a conversation for long-term memory. */
export interface AiConversationSummary {
  conversationId: string;
  summary: string;
  keyFacts: string[];
  generatedAt: Date;
}

/** Metadata attached to a Firestore conversation document. */
export interface AiConversationMetadata {
  userId: string;
  type: AiConversationType;
  context: AiConversationContext;
  summary?: AiConversationSummary;
}

// ─── Firestore raw shapes (with Timestamps, pre-adapter) ─────────────────────

export interface FirestoreAiConversation {
  userId: string;
  type: AiConversationType;
  title: string;
  messageCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  archivedAt?: Timestamp;
}

export interface FirestoreAiMessage {
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Timestamp;
}
