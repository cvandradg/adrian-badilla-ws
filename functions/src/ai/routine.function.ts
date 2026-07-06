import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';

const openAiApiKey = defineSecret('OPENAI_API_KEY');

/**
 * aiRoutine — Automatic workout routine generation (future feature).
 *
 * Prepared for: personalized routine creation, exercise explanation,
 * progressive overload planning, and injury-aware adjustments.
 *
 * Status: STUB — not yet implemented.
 */
export const aiRoutine = onCall(
  { secrets: [openAiApiKey], cors: true, invoker: 'public' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'La función debe llamarse estando autenticado.');
    }
    throw new HttpsError('unimplemented', 'aiRoutine estará disponible próximamente.');
  }
);
