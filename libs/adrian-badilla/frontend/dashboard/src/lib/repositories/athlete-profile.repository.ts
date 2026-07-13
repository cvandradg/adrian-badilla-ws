import { inject, Injectable } from '@angular/core';
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  Firestore,
} from '@angular/fire/firestore';
import {
  normalizeAthleteProfile,
  normalizeAthleteProfileFormData,
} from '@adrian-badilla/ai';
import type {
  AthleteProfile,
  AthleteProfileFormData,
} from '../types/athlete-profile.types';

function buildPersistedHealthPayload(
  health: AthleteProfile['health']
): Record<string, unknown> {
  return {
    hasDisease: health.hasDisease,
    hasInjury: health.hasInjury,
    conditions: health.conditions ?? [],
    injuries: health.injuries ?? [],
  };
}

// ─── Repository ───────────────────────────────────────────────────────────────

/**
 * AthleteProfileRepository
 *
 * Pure Firestore infrastructure. No state, no signals, no business logic.
 *
 * Reads and writes the `athleteProfile` field embedded in `users/{uid}`.
 * Heights, weights, age, and body fat are not touched here — those fields
 * are managed by the auth onboarding flow (UserRepository).
 *
 * All methods return Promise<T> so the feature can use clean async/await
 * without manual RxJS subscriptions.
 */
@Injectable({ providedIn: 'root' })
export class AthleteProfileRepository {
  readonly #db = inject(Firestore);

  /**
   * One-shot read of the `athleteProfile` field from `users/{uid}`.
   * Returns `null` if the document does not exist or the field is absent.
   */
  async getAthleteProfile(uid: string): Promise<AthleteProfile | null> {
    const ref = doc(this.#db, 'users', uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data();
    return normalizeAthleteProfile(
      (data['athleteProfile'] as AthleteProfile | undefined) ?? null
    ) as AthleteProfile | null;
  }

  /**
   * Writes the athlete profile data into `users/{uid}.athleteProfile`.
   *
   * @param uid         Firebase user UID.
   * @param formData    The form payload (training, nutrition, health, lifestyle).
   * @param isFirstSave Pass `true` on the initial save to stamp `completedAt`.
   *                    Pass `false` for subsequent edits (preserves `completedAt`).
   */
  async saveAthleteProfile(
    uid: string,
    formData: AthleteProfileFormData,
    isFirstSave: boolean
  ): Promise<void> {
    const ref = doc(this.#db, 'users', uid);
    const now = serverTimestamp();
    const normalizedFormData = normalizeAthleteProfileFormData(formData);

    const profileData: Record<string, unknown> = {
      ...normalizedFormData,
      health: buildPersistedHealthPayload(normalizedFormData.health),
      completed: true,
      updatedAt: now,
    };

    if (isFirstSave) {
      profileData['completedAt'] = now;
    }

    await updateDoc(ref, { athleteProfile: profileData });
  }
}
