import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteField,
  serverTimestamp,
} from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import type {
  UpsertUserPayload,
  UserProfile,
  PhysicalDataPayload,
  BmiCategory,
} from '../models/user-profile.model';

/**
 * ─── USER REPOSITORY ──────────────────────────────────────────────────────────
 *
 * Pure Firestore infrastructure layer. No state, no Signals, no business logic.
 * Responsible only for reading and writing `users/{uid}`.
 *
 * Decision (Fase 5):
 *  Separated from `auth.store` so Firestore access can be tested, mocked, and
 *  evolved independently from auth flow logic. The store calls this repository
 *  via `rxMethod`; the repository has no knowledge of the store.
 *
 * Collection: `users`
 * Document path: `users/{uid}`
 */

// ── BMI helpers (pure functions, no side effects) ────────────────────────────

function calcBmi(weightKg: number, heightCm: number): number {
  const h = heightCm / 100;
  return +(weightKg / (h * h)).toFixed(1);
}

function calcBmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obesity';
}
@Injectable({ providedIn: 'root' })
export class UserRepository {
  readonly #db = inject(Firestore);

  /**
   * Creates the profile document if it does not exist.
   * Updates mutable fields (`email`, `displayName`, `photoURL`, `provider`,
   * `updatedAt`, `lastLoginAt`) if the document already exists.
   * `createdAt` is written only once and never overwritten.
   */
  upsert(payload: UpsertUserPayload): Observable<void> {
    const ref = doc(this.#db, 'users', payload.uid);

    return from(
      getDoc(ref).then((snap) => {
        const now = serverTimestamp();

        if (!snap.exists()) {
          return setDoc(ref, {
            ...payload,
            createdAt: now,
            updatedAt: now,
            lastLoginAt: now,
            isActive: true,
          });
        }

        return updateDoc(ref, {
          email: payload.email,
          displayName: payload.displayName,
          photoURL: payload.photoURL,
          provider: payload.provider,
          updatedAt: now,
          lastLoginAt: now,
        });
      })
    );
  }

  getProfile(uid: string): Observable<UserProfile | null> {
    const ref = doc(this.#db, 'users', uid);
    return from(
      getDoc(ref).then((snap) =>
        snap.exists() ? (snap.data() as UserProfile) : null
      )
    );
  }

  /**
   * Writes the user's physical measurements gathered during onboarding.
   * Data is stored nested under `healthProfile` (new structure).
   * Legacy root-level fields are deleted to keep the document clean.
   * BMI and bmiCategory are computed server-side here so they travel with the data.
   */
  savePhysicalData(payload: PhysicalDataPayload): Observable<void> {
    const ref = doc(this.#db, 'users', payload.uid);
    const bmi = calcBmi(payload.weightKg, payload.heightCm);
    const bmiCategory = calcBmiCategory(bmi);

    return from(
      updateDoc(ref, {
        healthProfile: {
          ageYears: payload.ageYears,
          heightCm: payload.heightCm,
          weightKg: payload.weightKg,
          bodyFatPercent: payload.bodyFatPercent,
          bmi,
          bmiCategory,
          isComplete: true,
          updatedAt: serverTimestamp(),
        },
        // Clean up legacy root-level physical fields
        weightKg: deleteField(),
        heightCm: deleteField(),
        ageYears: deleteField(),
        bodyFatPercent: deleteField(),
        physicalDataComplete: deleteField(),
        updatedAt: serverTimestamp(),
      })
    );
  }
}
