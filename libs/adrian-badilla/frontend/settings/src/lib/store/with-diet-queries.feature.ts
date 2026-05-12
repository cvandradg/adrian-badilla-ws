import { inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  patchState,
  signalStoreFeature,
  withMethods,
  withProps,
  withState,
  withComputed,
} from '@ngrx/signals';
import {
  Firestore,
  collection,
  getDocs,
  orderBy,
  query,
  limit,
} from '@angular/fire/firestore';
import { Auth, user } from '@angular/fire/auth';
import type { RouteNavItem, RouteSupercenterItem } from '../types/diets.types';
import type { FirestoreMeal } from '../types/firestore-diet.types';
import { DAY_LABELS, DAY_ORDER } from '../constants/diet.constants';
import { groupMealsByDay } from '../adapters/firestore-meal.adapter';
import { userPaths } from '@adrian-badilla/ui/shared';

// ─── Types ───────────────────────────────────────────────────────────────────

interface DietQueriesState {
  /** Meals already mapped to UI shape, keyed by day ID. Transform happens once on load. */
  mealsByDay: Record<string, RouteSupercenterItem[]>;
  loadingDiet: boolean;
  errorDiet: string | null;
  /** Last loaded diet ID to prevent unnecessary re-fetches */
  _lastLoadedDietId: string | null;
}

// ─── Feature ─────────────────────────────────────────────────────────────────

/**
 * withDietQueries
 *
 * Loads a weekly diet from Firestore (no RxJS — pure async/await) and
 * patches `withRoutes` signals (`routes`, `selectedRoute`,
 * `selectedRouteSupercenters`) so the timeline and macro tracker update
 * automatically without UI changes.
 *
 * NEW Firestore path: users/{userId}/diets/{dietId}/meals (user-scoped)
 * userId comes from firebaseAuthStore (Firebase Authentication)
 *
 * MUST be composed AFTER withRoutes in the signalStore.
 *
 * Features:
 * - Signal-first design (no RxJS, no subscriptions)
 * - Automatic UI updates via signals
 * - Simple cache to prevent re-fetching same diet
 * - Centralized Firestore path management
 *
 * Migration path: getDocs → collectionData for realtime sync when needed.
 */
export function withDietQueries() {
  return signalStoreFeature(
    withState<DietQueriesState>({
      mealsByDay: {},
      loadingDiet: false,
      errorDiet: null,
      _lastLoadedDietId: null,
    }),

    withProps(() => ({
      _firestore: inject(Firestore),
      _auth: inject(Auth),
    })),

    withComputed((store) => {
      // Convert Firebase Auth Observable to Signal
      const userSignal = toSignal(user(store._auth), { initialValue: null });

      return {
        /** Extract userId from Firebase Auth signal */
        _userId: computed(() => userSignal()?.uid ?? null),
      };
    }),

    withMethods((store) => ({
      async loadWeeklyDiet(dietId: string): Promise<void> {
        // TODO: Restore to: const userId = store['_userId']();
        const userId = 'T7eoekKP2YarbxJvIMbo'; // Hardcoded for testing

        if (!userId) {
          patchState(store, { loadingDiet: false, errorDiet: 'Usuario no autenticado.' });
          return;
        }

        if (store['_lastLoadedDietId']() === dietId && Object.keys(store['mealsByDay']()).length > 0) {
          return;
        }

        patchState(store, { loadingDiet: true, errorDiet: null });

        try {
          const mealsPath = userPaths.meals(userId, dietId);

          const snap = await getDocs(
            query(
              collection(store['_firestore'], mealsPath),
              orderBy('dayOrder'),
              orderBy('order'),
            ),
          );

          const allMeals: FirestoreMeal[] = snap.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<FirestoreMeal, 'id'>),
          }));

          const mealsByDay = groupMealsByDay(allMeals);

          const routes: RouteNavItem[] = Object.keys(mealsByDay)
            .sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b))
            .map((dayId) => ({
              id: dayId,
              name: DAY_LABELS[dayId] ?? dayId,
              description: 'Semana actual',
            }));

          const firstDayId = routes[0]?.id;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          patchState(store as any, {
            mealsByDay,
            loadingDiet: false,
            _lastLoadedDietId: dietId,
            routes,
            selectedRoute: routes[0] ?? null,
            selectedRouteSupercenters: firstDayId ? (mealsByDay[firstDayId] ?? []) : [],
          });

        } catch (error) {
          patchState(store, {
            loadingDiet: false,
            errorDiet: error instanceof Error ? error.message : 'Error al cargar la dieta semanal',
          });
        }
      },
    })),

    withMethods((store) => ({
      async loadActiveDiet(): Promise<void> {
        // TODO: Restore to: const userId = store['_userId']();
        const userId = 'T7eoekKP2YarbxJvIMbo'; // Hardcoded for testing
        if (!userId) {
          return;
        }

        if (store['_lastLoadedDietId']()) {
          return;
        }

        try {
          const dietsPath = userPaths.diets(userId);

          const dietsSnap = await getDocs(
            query(collection(store['_firestore'], dietsPath), limit(1))
          );

          const firstDiet = dietsSnap.docs[0];
          if (!firstDiet) {
            return;
          }

          await store.loadWeeklyDiet(firstDiet.id);

        } catch (error) {
          // Silently handle errors
        }
      },

      selectDay(dayId: string): void {
        const mealsByDay = store['mealsByDay']();
        const meals = mealsByDay[dayId];

        if (!meals) {
          return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        patchState(store as any, {
          selectedRoute: { id: dayId, name: DAY_LABELS[dayId] ?? dayId, description: 'Semana actual' },
          selectedRouteSupercenters: meals,
        });
      },
    })),
  );
}

// Keep mapMeal/getIcon exported so existing usages don't break
export { adaptFirestoreMeal as mapMeal } from '../adapters/firestore-meal.adapter';
export { MEAL_ICONS as getIcon } from '../constants/diet.constants';

