import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import type {
  UpsertUserPayload,
  UserProfile,
  PhysicalDataPayload,
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
   * Sets `physicalDataComplete: true` so the app stops showing the form.
   */
  savePhysicalData(payload: PhysicalDataPayload): Observable<void> {
    const ref = doc(this.#db, 'users', payload.uid);
    return from(
      updateDoc(ref, {
        weightKg: payload.weightKg,
        heightCm: payload.heightCm,
        ageYears: payload.ageYears,
        bodyFatPercent: payload.bodyFatPercent,
        physicalDataComplete: true,
        updatedAt: serverTimestamp(),
      })
    );
  }
}
