import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';

const openAiApiKey = defineSecret('OPENAI_API_KEY');

/**
 * aiNutrition — Automatic nutrition plan generation (future feature).
 *
 * Prepared for: weekly meal plan generation, macro distribution,
 * dietary restriction handling, and plan explanation.
 *
 * Status: STUB — not yet implemented.
 */
export const aiNutrition = onCall(
  { secrets: [openAiApiKey], cors: true, invoker: 'public' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'La función debe llamarse estando autenticado.');
    }
    throw new HttpsError('unimplemented', 'aiNutrition estará disponible próximamente.');
  }
);
