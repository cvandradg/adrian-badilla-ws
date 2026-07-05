import { computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, user } from '@angular/fire/auth';
import {
  patchState,
  signalStoreFeature,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { AthleteProfileRepository } from '../repositories/athlete-profile.repository';
import type {
  AthleteProfile,
  AthleteProfileFormData,
} from '../types/athlete-profile.types';
import { validateAthleteProfileFormData } from '../types/athlete-profile.types';

// ─── State ────────────────────────────────────────────────────────────────────

interface AthleteProfileState {
  /** `undefined` = not yet loaded; `null` = loaded but not created yet. */
  athleteProfile: AthleteProfile | null | undefined;
  loadingAthleteProfile: boolean;
  savingAthleteProfile: boolean;
  athleteProfileError: string | null;
  showAthleteProfileForm: boolean;
}

// ─── Feature ──────────────────────────────────────────────────────────────────

/**
 * withAthleteProfileFeature
 *
 * Manages the advanced athlete profile questionnaire.
 *
 * Responsibilities:
 *  - Load the `athleteProfile` field from `users/{uid}` on demand.
 *  - Save / update the profile via `AthleteProfileRepository`.
 *  - Expose computed signals for card and form components.
 *  - Manage form open/close state.
 *
 * The questionnaire is OPTIONAL and NEVER shown automatically on sign-up.
 * It appears as a card on the Profile page and can be completed at any time.
 *
 * Does NOT duplicate: heightCm, weightKg, bodyFatPercent, ageYears.
 * Those live on the top-level user document (physicalDataComplete flow).
 *
 * Signal-first: no manual RxJS chains — only `toSignal` for auth state.
 */
export function withAthleteProfileFeature() {
  return signalStoreFeature(
    // ── Inject infrastructure ─────────────────────────────────────────────────
    withProps(() => ({
      _auth: inject(Auth),
      _athleteRepo: inject(AthleteProfileRepository),
    })),

    // ── State ─────────────────────────────────────────────────────────────────
    withState<AthleteProfileState>({
      athleteProfile: undefined,
      loadingAthleteProfile: false,
      savingAthleteProfile: false,
      athleteProfileError: null,
      showAthleteProfileForm: false,
    }),

    // ── Computed ──────────────────────────────────────────────────────────────
    withComputed((store) => {
      const firebaseUser = toSignal(user(store._auth), { initialValue: null });

      return {
        /** Current authenticated user UID, or null. */
        _athleteUserId: computed(() => firebaseUser()?.uid ?? null),

        /** True once the user has completed the athlete profile questionnaire. */
        athleteProfileCompleted: computed(
          () => store.athleteProfile()?.completed === true
        ),

        /** True when the profile has been loaded from Firestore (not undefined). */
        athleteProfileLoaded: computed(
          () => store.athleteProfile() !== undefined
        ),

        /**
         * ISO date string of the last update, or null.
         * Uses `updatedAt` from the Firestore Timestamp.
         */
        athleteProfileUpdatedAt: computed(() => {
          const profile = store.athleteProfile();
          if (!profile?.updatedAt) return null;
          return (profile.updatedAt as { toDate(): Date }).toDate();
        }),

        /**
         * True when the athlete has a severe injury or severe disease.
         *
         * AI Coach: when this is true, skip automatic routine generation and
         * surface a "pending manual review" message in the coach UI.
         * A human trainer must review and approve before the AI generates routines.
         */
        requiresManualReview: computed(() => {
          const profile = store.athleteProfile();
          if (!profile) return false;
          return (
            profile.health.injurySeverity === 'severe' ||
            profile.health.diseaseSeverity === 'severe'
          );
        }),
      };
    }),

    // ── Methods ───────────────────────────────────────────────────────────────
    withMethods((store) => ({
      /**
       * Loads the athlete profile from Firestore.
       * Call this when the Profile page initializes.
       * No-ops if the user is not authenticated.
       */
      async loadAthleteProfile(): Promise<void> {
        const uid = store['_athleteUserId']();
        if (!uid) return;

        patchState(store, {
          loadingAthleteProfile: true,
          athleteProfileError: null,
        });

        try {
          const profile = await store._athleteRepo.getAthleteProfile(uid);
          patchState(store, {
            athleteProfile: profile,
            loadingAthleteProfile: false,
          });
        } catch {
          patchState(store, {
            loadingAthleteProfile: false,
            athleteProfileError: 'Error al cargar el perfil deportivo.',
          });
        }
      },

      /**
       * Persists the athlete profile form data to `users/{uid}.athleteProfile`.
       * Stamps `completedAt` only on the very first save.
       * After a successful save, reloads the profile to get server timestamps.
       *
       * AI Coach: this data is the primary context source for routine generation.
       * Always re-read `requiresManualReview` after save to gate AI features.
       */
      async saveAthleteProfile(
        formData: AthleteProfileFormData
      ): Promise<void> {
        const uid = store['_athleteUserId']();
        if (!uid) return;

        // Validate required fields before hitting Firestore
        const validationError = validateAthleteProfileFormData(formData);
        if (validationError) {
          patchState(store, { athleteProfileError: validationError });
          return;
        }

        const isFirstSave = store.athleteProfile() == null;

        patchState(store, {
          savingAthleteProfile: true,
          athleteProfileError: null,
        });

        try {
          // Firestore rejects `undefined` field values — strip them before saving.
          // JSON round-trip removes all undefined keys from nested objects.
          const cleanData = JSON.parse(
            JSON.stringify(formData)
          ) as AthleteProfileFormData;

          await store._athleteRepo.saveAthleteProfile(
            uid,
            cleanData,
            isFirstSave
          );

          // Reload to get the server-stamped timestamps back
          const updated = await store._athleteRepo.getAthleteProfile(uid);
          patchState(store, {
            athleteProfile: updated,
            savingAthleteProfile: false,
            showAthleteProfileForm: false,
          });
        } catch {
          patchState(store, {
            savingAthleteProfile: false,
            athleteProfileError: 'Error al guardar el perfil deportivo.',
          });
        }
      },

      /** Opens the athlete profile questionnaire form. */
      openAthleteProfileForm(): void {
        patchState(store, {
          showAthleteProfileForm: true,
          athleteProfileError: null,
        });
      },

      /** Closes the athlete profile questionnaire form without saving. */
      closeAthleteProfileForm(): void {
        patchState(store, {
          showAthleteProfileForm: false,
          athleteProfileError: null,
        });
      },
    }))
  );
}
