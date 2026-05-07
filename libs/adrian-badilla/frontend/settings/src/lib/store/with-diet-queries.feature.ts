import { inject } from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import {
  Firestore,
  collection,
  getDocs,
  orderBy,
  query,
} from '@angular/fire/firestore';
import type { RouteNavItem, RouteSupercenterItem } from '../types/diets.types';
import type { FirestoreMeal } from '../types/firestore-diet.types';
import { DAY_LABELS, DAY_ORDER } from '../constants/diet.constants';
import { groupMealsByDay } from '../adapters/firestore-meal.adapter';

// ─── Types ───────────────────────────────────────────────────────────────────

/** Slice of withRoutes state that withDietQueries patches at runtime. */
interface RoutesStatePatch {
  routes: RouteNavItem[];
  selectedRoute: RouteNavItem | null;
  selectedRouteSupercenters: RouteSupercenterItem[];
}

interface DietQueriesState {
  /** Meals already mapped to UI shape, keyed by day ID. Transform happens once on load. */
  mealsByDay: Record<string, RouteSupercenterItem[]>;
  loadingDiet: boolean;
  errorDiet: string | null;
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
 * Firestore path: diets/{dietId}/meals (flat collection)
 *
 * MUST be composed AFTER withRoutes in the signalStore.
 *
 * Migration path: getDocs → collectionData for realtime sync when needed.
 */
export function withDietQueries() {
  return signalStoreFeature(
    withState<DietQueriesState>({
      mealsByDay: {},
      loadingDiet: false,
      errorDiet: null,
    }),

    withProps(() => ({
      _firestoreForDiet: inject(Firestore),
    })),

    withMethods((store) => {
      // Cross-feature patch target — withRoutes state lives in the same store instance.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const routesStore = store as any;

      return {
        /**
         * Fetches all meals for `dietId` from Firestore in a single query,
         * groups them by day and maps to UI shape once.
         * Patches routes + selectedRouteSupercenters so signals react immediately.
         */
        async loadWeeklyDiet(dietId: string): Promise<void> {
          patchState(store, { loadingDiet: true, errorDiet: null });

          try {
            // Migration path: getDocs → collectionData for realtime sync
            const snap = await getDocs(
              query(
                collection(store._firestoreForDiet, `diets/${dietId}/meals`),
                orderBy('dayOrder'),
                orderBy('order'),
              ),
            );

            const allMeals: FirestoreMeal[] = snap.docs.map((doc) => ({
              id: doc.id,
              ...(doc.data() as Omit<FirestoreMeal, 'id'>),
            }));

            // Transform once — stored already adapted, no re-mapping needed later
            const mealsByDay = groupMealsByDay(allMeals);

            const routes: RouteNavItem[] = Object.keys(mealsByDay)
              .sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b))
              .map((dayId) => ({
                id: dayId,
                name: DAY_LABELS[dayId] ?? dayId,
                description: 'Semana actual',
              }));

            const firstDayId = routes[0]?.id;

            patchState(routesStore, {
              mealsByDay,
              loadingDiet: false,
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

        /**
         * Selects a day — reads already-transformed meals from mealsByDay.
         * No Firestore calls, no re-mapping.
         */
        selectDay(dayId: string): void {
          const mealsByDay = store.mealsByDay();
          const meals = mealsByDay[dayId];

          if (!meals) return;

          patchState(routesStore, {
            selectedRoute: { id: dayId, name: DAY_LABELS[dayId] ?? dayId, description: 'Semana actual' },
            selectedRouteSupercenters: meals,
          });
        },
      };
    }),
  );
}

// Keep mapMeal/getIcon exported so existing usages don't break
export { adaptFirestoreMeal as mapMeal } from '../adapters/firestore-meal.adapter';
export { MEAL_ICONS as getIcon } from '../constants/diet.constants';

