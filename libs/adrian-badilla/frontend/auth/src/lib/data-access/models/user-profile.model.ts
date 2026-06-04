import type { Timestamp } from 'firebase/firestore';

export type AuthProvider = 'google' | 'password' | 'anonymous';

/**
 * Shape of the document stored at `users/{uid}` in Firestore.
 * All fields are optional on read to handle partial writes gracefully.
 */
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  provider: AuthProvider;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;
  isActive: boolean;
  // ── Physical data (filled during onboarding) ──────────────────────────────
  weightKg?: number;
  heightCm?: number;
  ageYears?: number;
  bodyFatPercent?: number;
  /** True once the user has submitted the physical-data onboarding form. */
  physicalDataComplete?: boolean;
}

/**
 * Payload used when upserting — only the mutable fields the auth flow
 * knows about. `createdAt` is set once at creation, never overwritten.
 */
export type UpsertUserPayload = Pick<
  UserProfile,
  'uid' | 'email' | 'displayName' | 'photoURL' | 'provider'
>;

/** Payload for saving physical data collected during onboarding. */
export interface PhysicalDataPayload {
  uid: string;
  weightKg: number;
  heightCm: number;
  ageYears: number;
  bodyFatPercent: number | null;
}
