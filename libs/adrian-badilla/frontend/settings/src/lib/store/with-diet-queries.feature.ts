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
  collectionGroup,
  getDocs,
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
  mealsByDay: Record<string, RouteSupercenterItem[]>;
  loadingDiet: boolean;
  errorDiet: string | null;
  _lastLoadedDietId: string | null;
  /** True when loadActiveDiet() found no diet document for this user. */
  noActiveDiet: boolean;
  /** True once loadActiveDiet() has finished, even if no diet was found. */
  dietFetchDone: boolean;
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
 */
export function withDietQueries() {
  return signalStoreFeature(
    withState<DietQueriesState>({
      mealsByDay: {},
      loadingDiet: false,
      errorDiet: null,
      _lastLoadedDietId: null,
      noActiveDiet: false,
      dietFetchDone: false,
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
        const userId = store['_userId']();

        if (!userId) {
          patchState(store, {
            loadingDiet: false,
            errorDiet: 'Usuario no autenticado.',
          });
          return;
        }

        if (
          store['_lastLoadedDietId']() === dietId &&
          Object.keys(store['mealsByDay']()).length > 0
        ) {
          return;
        }

        patchState(store, { loadingDiet: true, errorDiet: null });

        try {
          const mealsPath = userPaths.meals(userId, dietId);

          const snap = await getDocs(
            query(collection(store['_firestore'], mealsPath))
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

          patchState(store as any, {
            mealsByDay,
            loadingDiet: false,
            _lastLoadedDietId: dietId,
            routes,
            selectedRoute: routes[0] ?? null,
            selectedRouteSupercenters: firstDayId
              ? mealsByDay[firstDayId] ?? []
              : [],
          });
        } catch (error) {
          patchState(store, {
            loadingDiet: false,
            errorDiet:
              error instanceof Error
                ? error.message
                : 'Error al cargar la dieta semanal',
          });
        }
      },
    })),

    withMethods((store) => ({
      async loadActiveDiet(): Promise<void> {
        const userId = store['_userId']();

        if (!userId) return;

        if (store['_lastLoadedDietId']()) return;

        if (store['noActiveDiet']()) return;

        const dietsPath = userPaths.diets(userId);
        patchState(store, { loadingDiet: true, errorDiet: null });

        try {
          const dietsSnap = await getDocs(
            query(collection(store['_firestore'], dietsPath), limit(1))
          );

          const firstDiet = dietsSnap.docs[0];

          if (firstDiet) {
            await store.loadWeeklyDiet(firstDiet.id);
            patchState(store, { dietFetchDone: true });
            return;
          }

          // Fallback: hollow document — diet doc was never explicitly created,
          // only its meals subcollection exists. Discover dietId via collectionGroup.
          let fallbackDietId: string | null = null;

          try {
            const mealsGroupSnap = await getDocs(
              query(collectionGroup(store['_firestore'], 'meals'), limit(1))
            );

            for (const mealDoc of mealsGroupSnap.docs) {
              const expectedPrefix = `users/${userId}/diets/`;
              if (mealDoc.ref.path.startsWith(expectedPrefix)) {
                fallbackDietId = mealDoc.ref.parent.parent?.id ?? null;
                break;
              }
            }
          } catch {
            /* fallback failed — treat as no active diet */
          }

          if (fallbackDietId) {
            await store.loadWeeklyDiet(fallbackDietId);
            patchState(store, { dietFetchDone: true });
            return;
          }

          patchState(store, {
            noActiveDiet: true,
            loadingDiet: false,
            dietFetchDone: true,
          });
        } catch (error) {
          patchState(store, {
            loadingDiet: false,
            noActiveDiet: true,
            dietFetchDone: true,
            errorDiet:
              error instanceof Error
                ? error.message
                : 'Error al verificar la dieta activa.',
          });
        }
      },

      selectDay(dayId: string): void {
        const mealsByDay = store['mealsByDay']();
        const meals = mealsByDay[dayId];

        if (!meals) {
          return;
        }

        patchState(store as any, {
          selectedRoute: {
            id: dayId,
            name: DAY_LABELS[dayId] ?? dayId,
            description: 'Semana actual',
          },
          selectedRouteSupercenters: meals,
        });
      },
    }))
  );
}

// Keep mapMeal/getIcon exported so existing usages don't break
export { adaptFirestoreMeal as mapMeal } from '../adapters/firestore-meal.adapter';
export { MEAL_ICONS as getIcon } from '../constants/diet.constants';
