// ─── AI Firestore Path Helpers ────────────────────────────────────────────────
// Centralized Firestore path builders for all AI-related collections.
// Change the structure here once — all repositories update automatically.

/**
 * Firestore paths for AI features.
 * All paths are user-scoped under users/{uid}/.
 */
export const aiFirestorePaths = {
  /** users/{uid}/ai-conversations */
  conversations: (uid: string) => `users/${uid}/ai-conversations`,

  /** users/{uid}/ai-conversations/{conversationId} */
  conversation: (uid: string, conversationId: string) =>
    `users/${uid}/ai-conversations/${conversationId}`,

  /** users/{uid}/ai-conversations/{conversationId}/messages */
  messages: (uid: string, conversationId: string) =>
    `users/${uid}/ai-conversations/${conversationId}/messages`,

  /** users/${uid}/ai-memory/long-term */
  longTermMemory: (uid: string) => `users/${uid}/ai-memory/long-term`,

  /** users/{uid}/ai-memory/recent-summary */
  recentSummary: (uid: string) => `users/${uid}/ai-memory/recent-summary`,
} as const;
