import { signalStore } from '@ngrx/signals';
import { withChatFeature } from './with-chat.feature';

/**
 * aiStore
 *
 * Single source of truth for all AI features in the application.
 *
 * Architecture:
 *  - This store is composition only — it defines no state, computed, or methods.
 *  - All behavior lives in the individual Feature files.
 *  - Adding a new AI feature = one line here + one new withXFeature() file.
 *
 * Current features:
 *  - withChatFeature: in-session chat with the AI Coach
 *
 * Prepared for (future sprints — add without reorganizing):
 *  - withConversationFeature: persisted conversation history
 *  - withMemoryFeature: long-term conversational memory
 *  - withCoachFeature: personalized coaching sessions
 *  - withRoutineGeneratorFeature: AI routine generation
 *  - withNutritionGeneratorFeature: AI nutrition plan generation
 *  - withAssessmentFeature: periodic self-assessments
 *  - withWeeklyCheckinFeature: emotional tracking + weekly summaries
 *  - withRecommendationsFeature: intelligent recommendations + risk alerts
 *  - withAiNotificationsFeature: real-time AI-driven notifications
 *
 * Security invariant:
 *  - This store never calls OpenAI directly.
 *  - All AI communication goes through Firebase Callable Functions.
 *  - The OpenAI API key never reaches Angular.
 */
export const aiStore = signalStore(
  { providedIn: 'root' },

  withChatFeature()

  // ── Future features (uncomment as implemented) ────────────────────────────
  // withConversationFeature(),
  // withMemoryFeature(),
  // withCoachFeature(),
  // withRoutineGeneratorFeature(),
  // withNutritionGeneratorFeature(),
  // withAssessmentFeature(),
  // withWeeklyCheckinFeature(),
  // withRecommendationsFeature(),
  // withAiNotificationsFeature(),
);

export type AiStore = InstanceType<typeof aiStore>;
