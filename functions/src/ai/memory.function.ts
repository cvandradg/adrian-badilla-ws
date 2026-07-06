import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';

const openAiApiKey = defineSecret('OPENAI_API_KEY');

/**
 * aiMemory — Conversational memory management (future feature).
 *
 * Prepared for: long-term memory summarization, context building,
 * key fact extraction, and user profile enrichment.
 *
 * Status: STUB — not yet implemented.
 */
export const aiMemory = onCall(
  { secrets: [openAiApiKey], cors: true, invoker: 'public' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'La función debe llamarse estando autenticado.');
    }
    throw new HttpsError('unimplemented', 'aiMemory estará disponible próximamente.');
  }
);
