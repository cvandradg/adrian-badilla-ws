import type { Timestamp } from 'firebase/firestore';

export type AuthProvider = 'google' | 'password' | 'anonymous';

/** Canonical BMI category IDs stored in Firestore. */
export type BmiCategory = 'underweight' | 'normal' | 'overweight' | 'obesity';

/**
 * Physical health data stored as a nested object at `users/{uid}.healthProfile`.
 * Replaces the legacy root-level physical fields (weightKg, heightCm, etc.).
 */
export interface HealthProfile {
  ageYears: number;
  heightCm: number;
  weightKg: number;
  bodyFatPercent: number | null;
  bmi: number;
  bmiCategory: BmiCategory;
  /** True once the user has submitted the physical-data onboarding form. */
  isComplete: boolean;
  updatedAt: Timestamp;
}

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
  /** Grouped physical data (new structure). */
  healthProfile?: HealthProfile;
  // ── Legacy root-level fields — kept only for backward-compat read fallback ──
  // These were moved to healthProfile. Remove once all users have re-saved.
  weightKg?: number;
  heightCm?: number;
  ageYears?: number;
  bodyFatPercent?: number;
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
