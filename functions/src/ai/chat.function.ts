import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { buildChatSystemPrompt } from './_shared/chat.prompt.js';
import { callOpenAiChat } from './_shared/openai.client.js';

// ─── Secret ───────────────────────────────────────────────────────────────────
// The API key lives exclusively in Google Secret Manager.
// Angular never sees this value.
const openAiApiKey = defineSecret('OPENAI_API_KEY');

// ─── Request / Response types ─────────────────────────────────────────────────

interface AiChatRequest {
  message: string;
  context?: {
    remainingMacros?: { protein: number; carbs: number; fats: number } | null;
    activeMealId?: string | null;
  };
}

interface AiChatResponse {
  content: string;
  mealSuggestion: {
    items: Array<{ name: string; protein: number; carbs: number; fats: number }>;
    totals: { protein: number; carbs: number; fats: number };
  } | null;
}

// ─── Cloud Function ───────────────────────────────────────────────────────────

/**
 * aiChat — AI Coach chat endpoint.
 *
 * Security invariants:
 *  - Requires Firebase Authentication (throws 'unauthenticated' otherwise)
 *  - API key is read ONLY from Secret Manager via process.env.OPENAI_API_KEY
 *  - The API key is NEVER returned to the client or logged
 *  - Input is validated before being forwarded to OpenAI
 *
 * Flow:
 *   Angular → aiChat (onCall) → OpenAI → Angular
 *
 * The frontend never speaks directly to OpenAI.
 */
export const aiChat = onCall(
  { secrets: [openAiApiKey], cors: true, invoker: 'public' },
  async (request): Promise<AiChatResponse> => {
    // ── Auth guard ────────────────────────────────────────────────────────────
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'La función debe llamarse estando autenticado.'
      );
    }

    // ── Input validation ──────────────────────────────────────────────────────
    const { message, context } = request.data as AiChatRequest;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      throw new HttpsError('invalid-argument', 'El mensaje no puede estar vacío.');
    }

    if (message.trim().length > 500) {
      throw new HttpsError(
        'invalid-argument',
        'El mensaje excede el límite de 500 caracteres.'
      );
    }

    // ── Build system prompt with user context ─────────────────────────────────
    const systemPrompt = buildChatSystemPrompt({
      remainingMacros: context?.remainingMacros ?? null,
    });

    // ── Call OpenAI via the shared client (key from Secret Manager) ───────────
    const result = await callOpenAiChat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message.trim() },
    ]);

    return {
      content: result.content,
      mealSuggestion: result.mealSuggestion,
    };
  }
);
