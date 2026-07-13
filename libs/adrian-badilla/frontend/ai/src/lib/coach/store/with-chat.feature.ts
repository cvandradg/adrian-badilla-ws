import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import type { AiMessage } from '../models/ai-message.model';
import type { AiChatContext, PendingMealSuggestion } from '../types/ai-chat.types';
import { AiChatRepository } from '../repositories/ai-chat.repository';
import { withCallState } from './with-call-state.feature';

// ─── State ────────────────────────────────────────────────────────────────────

interface ChatState {
  /** All messages in the current chat session (in-memory, not persisted). */
  messages: AiMessage[];
  /** ID of the meal the chat was opened for (null = free chat). */
  activeMealId: string | null;
  /**
   * Meal suggestion waiting for user confirmation (Apply / Reject).
   * Set by the store when the AI returns a mealSuggestion payload.
   */
  pendingMealSuggestion: PendingMealSuggestion | null;
}

// ─── Feature ──────────────────────────────────────────────────────────────────

/**
 * withChatFeature
 *
 * Manages the active chat session between the user and the AI Coach.
 *
 * Responsibilities:
 *  - Holds all in-memory chat messages.
 *  - Calls AiChatRepository → Firebase Callable Function → OpenAI.
 *  - Tracks pending meal suggestion (for Apply/Reject UI).
 *  - Manages which meal the chat is associated with.
 *
 * Security invariant:
 *  - This feature NEVER calls OpenAI directly.
 *  - All AI communication goes through AiChatService → Firebase Function.
 *  - The OpenAI API key never reaches Angular.
 *
 * Dependencies: AiChatRepository (inject via withMethods).
 */
export function withChatFeature() {
  return signalStoreFeature(
    // ── Call state (chatLoading, chatSuccess, chatError) ────────────────────
    withCallState('chat'),

    // ── Domain state ─────────────────────────────────────────────────────────
    withState<ChatState>({
      messages: [],
      activeMealId: null,
      pendingMealSuggestion: null,
    }),

    // ── Computed ─────────────────────────────────────────────────────────────
    withComputed((store) => ({
      /** Total number of messages in the current session. */
      chatMessageCount: computed(() => store.messages().length),

      /** Last message in the list, or null if empty. */
      lastChatMessage: computed(() => {
        const msgs = store.messages();
        return msgs.length > 0 ? msgs[msgs.length - 1] : null;
      }),

      /** True when the AI returned a meal suggestion that hasn't been acted on. */
      hasPendingMealSuggestion: computed(
        () => store.pendingMealSuggestion() !== null
      ),
    })),

    // ── Methods ───────────────────────────────────────────────────────────────
    withMethods((store) => {
      const chatRepository = inject(AiChatRepository);

      return {
        /**
         * Opens the chat for a specific meal (from the diet tracker).
         * Sets the activeMealId so meal suggestions can be applied to the right meal.
         */
        openChatForMeal(mealId: string): void {
          patchState(store, { activeMealId: mealId });
        },

        /** Resets activeMealId (after chat is closed or meal context cleared). */
        clearActiveMeal(): void {
          patchState(store, { activeMealId: null });
        },

        /** Clears all messages and resets the session. */
        clearChat(): void {
          patchState(store, {
            messages: [],
            pendingMealSuggestion: null,
            activeMealId: null,
          });
          store.chatResetState();
        },

        /**
         * Accepts the AI meal suggestion and clears the pending state.
         * The diet tracker integration is the caller's responsibility.
         */
        applyMealSuggestion(): PendingMealSuggestion | null {
          const suggestion = store.pendingMealSuggestion();
          patchState(store, { pendingMealSuggestion: null, activeMealId: null });
          return suggestion;
        },

        /** Dismisses the AI meal suggestion without applying it. */
        rejectMealSuggestion(): void {
          patchState(store, { pendingMealSuggestion: null });
        },

        /**
         * Main entry point: sends a user message to the AI Coach.
         *
         * Flow:
         *   1. Appends user message to history
         *   2. Sets loading state
         *   3. Calls AiChatRepository.sendMessage() → Firebase Function → OpenAI
         *   4. Appends assistant response to history
         *   5. If response contains a mealSuggestion and activeMealId is set,
         *      stores it as pendingMealSuggestion
         *   6. Clears loading state
         *
         * Error handling: appends a user-friendly error message to history.
         */
        async sendMessage(text: string, context: AiChatContext): Promise<void> {
          const trimmed = text.trim();
          if (!trimmed) return;

          // 1. Append user message
          const userMsg: AiMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            content: trimmed,
            timestamp: Date.now(),
          };

          patchState(store, {
            messages: [...store.messages(), userMsg],
          });

          // 2. Set loading state
          store.chatSetLoading();

          try {
            // 3. Call Firebase Function (never calls OpenAI directly)
            const response = await chatRepository.sendMessage(trimmed, {
              remainingMacros: context.remainingMacros ?? null,
              activeMealId: store.activeMealId() ?? context.activeMealId ?? null,
            });

            // 4. Append assistant response
            const assistantMsg: AiMessage = {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: response.content,
              timestamp: Date.now(),
            };

            const updates: Partial<ChatState> & {
              pendingMealSuggestion?: PendingMealSuggestion | null;
            } = {
              messages: [...store.messages(), assistantMsg],
            };

            // 5. Store meal suggestion if present and meal context is active
            const mealId = store.activeMealId() ?? context.activeMealId ?? null;
            if (response.mealSuggestion && mealId) {
              updates.pendingMealSuggestion = {
                mealId,
                items: response.mealSuggestion.items,
                totals: response.mealSuggestion.totals,
              };
            }

            patchState(store, updates);

            // 6. Clear loading
            store.chatSetSuccess();
          } catch (err) {
            // Append friendly error message
            const errorMsg: AiMessage = {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: '⚠️ Ocurrió un error al contactar al Coach IA. Por favor, intenta de nuevo.',
              timestamp: Date.now(),
            };

            patchState(store, {
              messages: [...store.messages(), errorMsg],
            });

            store.chatSetError(
              err instanceof Error ? err.message : 'Error desconocido'
            );
          }
        },
      };
    })
  );
}
