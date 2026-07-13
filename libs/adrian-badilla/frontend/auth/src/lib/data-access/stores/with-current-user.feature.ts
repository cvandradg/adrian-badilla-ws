import {
  signalStoreFeature,
  withState,
  withComputed,
  withMethods,
  patchState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { pipe, switchMap, tap, from, distinctUntilChanged, map } from 'rxjs';
import type {
  PhysicalDataPayload,
  AuthProvider,
  UserProfile,
} from '../models/user-profile.model';
import type { User } from 'firebase/auth';
import { UserRepository } from '../repositories/user.repository';
import type { FirebaseAuthOut } from '../utils/firebase-auth';

// ─── State shape ─────────────────────────────────────────────────────────────

interface CurrentUserState {
  firebaseUser: User | null;
  userProfile: UserProfile | null | undefined;
  authInitialized: boolean;
  savingPhysicalData: boolean;
  physicalDataError: string | null;
}

// ─── Deps type ───────────────────────────────────────────────────────────────

type CurrentUserDeps = Pick<FirebaseAuthOut['methods'], '_signOut'> &
  Pick<FirebaseAuthOut['props'], '_getUserSession$'>;

/**
 * The public methods exposed by this feature — used as a type constraint
 * in features that need to call `upsertUserProfile` (e.g. with-login).
 */
export interface WithCurrentUserMethods {
  upsertUserProfile: (user: User) => void;
  logout: (value: void) => void;
  initAuthListener: (value: void) => void;
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function resolveProvider(user: User): AuthProvider {
  const providerId = user.providerData?.[0]?.providerId ?? 'password';
  if (providerId === 'google.com') return 'google';
  if (providerId === 'password') return 'password';
  return 'anonymous';
}

/**
 * ─── withCurrentUser ──────────────────────────────────────────────────────────
 *
 * Adds global auth-state tracking to the store:
 *  - Listens to Firebase `authState` and keeps `firebaseUser` in sync.
 *  - Exposes all user-derived computeds (isLoggedIn, userId, userName, …).
 *  - Owns `logout`, `initAuthListener`, and `upsertUserProfile`.
 *
 * Usage: compose into `firebaseAuthStore` via `withFeature`.
 */
export function withCurrentUser<T extends CurrentUserDeps>(store: T) {
  return signalStoreFeature(
    withState<CurrentUserState>({
      firebaseUser: null,
      userProfile: undefined,
      authInitialized: false,
      savingPhysicalData: false,
      physicalDataError: null,
    }),

    withComputed((s) => ({
      isAuthenticated: computed(() => !!s.firebaseUser()),
      isLoggedIn: computed(() => !!s.firebaseUser() && s.authInitialized()),
      userId: computed(() => s.firebaseUser()?.uid ?? null),
      userEmail: computed(() => s.firebaseUser()?.email ?? null),
      userName: computed(
        () =>
          s.firebaseUser()?.displayName ||
          s.firebaseUser()?.email?.split('@')[0] ||
          null
      ),
      userPhoto: computed(() => s.firebaseUser()?.photoURL ?? null),
      isAnonymous: computed(() => s.firebaseUser()?.isAnonymous ?? false),
      hasProfile: computed(() => s.userProfile() != null),
      authProvider: computed<AuthProvider | null>(() => {
        const u = s.firebaseUser();
        return u ? resolveProvider(u) : null;
      }),
      /**
       * True when the user is logged in but hasn't completed physical onboarding.
       * `undefined` profile = still loading (don't show form yet).
       * Checks `healthProfile.isComplete` first; falls back to legacy `physicalDataComplete`.
       */
      needsOnboarding: computed(() => {
        if (!s.authInitialized() || !s.firebaseUser()) return false;
        const profile = s.userProfile();
        if (profile === undefined) return false; // still loading
        if (profile === null) return true; // doc not found
        return !(
          profile.healthProfile?.isComplete ??
          profile.physicalDataComplete ??
          false
        );
      }),
    })),

    // Block 1 — upsertUserProfile + loadUserProfile
    withMethods((innerStore) => {
      const repo = inject(UserRepository);

      return {
        /** Loads (or refreshes) the full profile document from Firestore. */
        loadUserProfile: rxMethod<string>(
          pipe(
            switchMap((uid) =>
              repo.getProfile(uid).pipe(
                tapResponse({
                  next: (profile) =>
                    patchState(innerStore, { userProfile: profile }),
                  error: (err: unknown) =>
                    console.error('[auth] loadUserProfile failed', err),
                })
              )
            )
          )
        ),

        /**
         * Upserts the Firestore profile for the given Firebase user.
         * After writing, re-loads the profile to populate physicalDataComplete.
         */
        upsertUserProfile: rxMethod<User>(
          pipe(
            switchMap((user) =>
              repo
                .upsert({
                  uid: user.uid,
                  email: user.email ?? '',
                  displayName: user.displayName ?? '',
                  photoURL: user.photoURL ?? '',
                  provider: resolveProvider(user),
                })
                .pipe(
                  switchMap(() => repo.getProfile(user.uid)),
                  tapResponse({
                    next: (profile) =>
                      patchState(innerStore, { userProfile: profile }),
                    error: (err: unknown) =>
                      console.error('[auth] upsertUserProfile failed', err),
                  })
                )
            )
          )
        ),
      };
    }),

    // Block 2 — initAuthListener + logout (can call innerStore.upsertUserProfile)
    withMethods((innerStore) => {
      const router = inject(Router);

      return {
        /**
         * Subscribes to Firebase authState once (called in app root).
         * Updates firebaseUser / authInitialized and auto-upserts the profile
         * on every sign-in, including session restoration on page reload.
         */
        initAuthListener: rxMethod<void>(
          pipe(
            switchMap(() =>
              store._getUserSession$().pipe(
                distinctUntilChanged((a, b) => a?.uid === b?.uid),
                tap((user) => {
                  patchState(innerStore, {
                    firebaseUser: user,
                    authInitialized: true,
                  });
                  if (user) {
                    innerStore.upsertUserProfile(user);
                  }
                })
              )
            )
          )
        ),

        /** Signs the current user out and redirects to the login page. */
        logout: rxMethod<void>(
          pipe(
            switchMap(() =>
              from(store._signOut()).pipe(
                tapResponse({
                  next: () => {
                    patchState(innerStore, {
                      firebaseUser: null,
                      userProfile: undefined,
                    });
                    router.navigateByUrl('/auth/login', { replaceUrl: true });
                  },
                  error: (err: unknown) =>
                    console.error('[auth] logout failed', err),
                })
              )
            )
          )
        ),
      };
    }),

    // Block 3 — savePhysicalData (no cross-block deps)
    withMethods((innerStore) => {
      const repo = inject(UserRepository);

      return {
        /**
         * Saves the user's physical measurements and marks onboarding complete.
         * Re-loads the profile so all computed signals update immediately.
         */
        savePhysicalData: rxMethod<PhysicalDataPayload>(
          pipe(
            tap(() =>
              patchState(innerStore, {
                savingPhysicalData: true,
                physicalDataError: null,
              })
            ),
            switchMap((payload) =>
              repo.savePhysicalData(payload).pipe(
                switchMap(() => repo.getProfile(payload.uid)),
                map((profile) => ({ profile })),
                tapResponse({
                  next: ({ profile }) =>
                    patchState(innerStore, {
                      userProfile: profile,
                      savingPhysicalData: false,
                    }),
                  error: (err: unknown) => {
                    console.error('[auth] savePhysicalData failed', err);
                    patchState(innerStore, {
                      savingPhysicalData: false,
                      physicalDataError:
                        'Error al guardar los datos. Inténtalo de nuevo.',
                    });
                  },
                })
              )
            )
          )
        ),
      };
    })
  );
}
