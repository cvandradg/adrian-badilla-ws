import { inject, Injectable } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { AI_FUNCTION_NAMES } from '../constants/ai-function-names';
import type { AiChatContext, AiChatFunctionResponse } from '../types/ai-chat.types';

// ─── Request shape (mirrors Cloud Function input) ─────────────────────────────

interface AiChatRequest {
  message: string;
  context?: {
    remainingMacros?: { protein: number; carbs: number; fats: number } | null;
    activeMealId?: string | null;
  };
}

// ─── Repository ───────────────────────────────────────────────────────────────

/**
 * AiChatRepository
 *
 * Single responsibility: invoke the `aiChat` Firebase Callable Function.
 *
 * Security contract:
 *  - This repository NEVER calls OpenAI directly.
 *  - The API key lives exclusively in Google Secret Manager, read by the Function.
 *  - Angular only sends the user's message and optional context.
 *
 * Architecture:
 *  - No state (no signals, no subjects, no stored data).
 *  - No business logic. Pure Firebase I/O only.
 *  - Returns a Promise<AiChatFunctionResponse>.
 *  - Errors propagate to the caller (withChatFeature handles them).
 */
@Injectable({ providedIn: 'root' })
export class AiChatRepository {
  readonly #functions = inject(Functions);

  /**
   * Sends a user message to the AI Chat Cloud Function.
   *
   * @param message   The user's input text (trimmed, non-empty).
   * @param context   Optional macro/meal context to enrich the AI response.
   * @returns         The AI's structured response (content + optional meal suggestion).
   */
  sendMessage(
    message: string,
    context: AiChatContext
  ): Promise<AiChatFunctionResponse> {
    const fn = httpsCallable<AiChatRequest, AiChatFunctionResponse>(
      this.#functions,
      AI_FUNCTION_NAMES.CHAT
    );

    return fn({
      message,
      context: {
        remainingMacros: context.remainingMacros ?? null,
        activeMealId: context.activeMealId ?? null,
      },
    }).then((result) => result.data);
  }
}
