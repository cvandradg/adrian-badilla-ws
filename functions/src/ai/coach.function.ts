import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';

const openAiApiKey = defineSecret('OPENAI_API_KEY');

/**
 * aiCoach — Virtual coach endpoint (future feature).
 *
 * Prepared for: personalized coaching sessions, motivational advice,
 * progress review, and long-term goal tracking.
 *
 * Status: STUB — not yet implemented.
 */
export const aiCoach = onCall(
  { secrets: [openAiApiKey], cors: true, invoker: 'public' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'La función debe llamarse estando autenticado.');
    }
    throw new HttpsError('unimplemented', 'aiCoach estará disponible próximamente.');
  }
);
