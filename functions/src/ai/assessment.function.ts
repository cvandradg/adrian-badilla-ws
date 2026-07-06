import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';

const openAiApiKey = defineSecret('OPENAI_API_KEY');

/**
 * aiAssessment — Periodic user self-assessment endpoint (future feature).
 *
 * Prepared for: structured questionnaires, AI-powered analysis,
 * progress scoring, and personalized feedback.
 *
 * Status: STUB — not yet implemented.
 */
export const aiAssessment = onCall(
  { secrets: [openAiApiKey], cors: true, invoker: 'public' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'La función debe llamarse estando autenticado.');
    }
    throw new HttpsError('unimplemented', 'aiAssessment estará disponible próximamente.');
  }
);
