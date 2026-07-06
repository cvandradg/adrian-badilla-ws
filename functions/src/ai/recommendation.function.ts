import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';

const openAiApiKey = defineSecret('OPENAI_API_KEY');

/**
 * aiRecommendation — Intelligent recommendations + risk detection (future feature).
 *
 * Prepared for: routine adjustment suggestions, nutrition alerts,
 * overtraining detection, and admin notifications.
 *
 * Status: STUB — not yet implemented.
 */
export const aiRecommendation = onCall(
  { secrets: [openAiApiKey], cors: true, invoker: 'public' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'La función debe llamarse estando autenticado.');
    }
    throw new HttpsError('unimplemented', 'aiRecommendation estará disponible próximamente.');
  }
);
