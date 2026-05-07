import {
  signalStoreFeature,
  withState,
  withComputed,
  withMethods,
  patchState,
  withFeature,
} from '@ngrx/signals';
import { Type, computed } from '@angular/core';
import type { RouteNavItem, RouteSupercenterItem } from '../types/diets.types';
import { withDialogs } from './with-dialogs.feature';

interface RoutesState {
  routes: RouteNavItem[];
  selectedRoute: RouteNavItem | null;
  selectedRouteSupercenters: RouteSupercenterItem[];
  routeSearchQuery: string;
  createRouteisLoading: boolean;
  saveRouteisLoading: boolean;
}

export function withRoutes<T extends Record<string, any>>(storeContext: T) {
  return signalStoreFeature(
    withState<RoutesState>({
      routes: [],
      selectedRoute: null,
      selectedRouteSupercenters: [],
      routeSearchQuery: '',
      createRouteisLoading: false,
      saveRouteisLoading: false,
    }),

    withComputed((store) => ({
      filteredRoutes: computed(() => {
        const query = store.routeSearchQuery().toLowerCase();
        return store.routes().filter((r) => r.name?.toLowerCase().includes(query));
      }),
      isSavingRoute: computed(() => store.createRouteisLoading() || store.saveRouteisLoading()),
    })),

    withFeature((innerStore) => withDialogs(storeContext)),

    withMethods((store) => ({
      updateRouteSearchQuery(query: string) {
        patchState(store, { routeSearchQuery: query });
      },

      clearRouteSearchQuery() {
        patchState(store, { routeSearchQuery: '' });
      },

      selectRoute(routeId: string) {
        const route = store.routes().find((r) => r.id === routeId);
        patchState(store, {
          selectedRoute: route ?? null,
        });
      },

      saveRoute(data: any) {
        console.log('💾 Mock saveRoute', data);
        patchState(store, { saveRouteisLoading: false });
      },

      openDialogToAddRoute: (component: Type<unknown>) => {
        store['openDialogToAddRoute'](component);
      },

      openDialogToAddSupercenter: (component: Type<unknown>) => {
        store['openDialogToAddSupercenter'](component);
      },

      openDialogToEditRouteDiet: (component: Type<unknown>, item: RouteSupercenterItem) => {
        store['openDialogToEditRouteDiet'](component, item);
      },

      openDialogToDeleteRoute: (component: Type<unknown>, route: RouteNavItem) => {
        store['openDialogToDeleteRoute'](component, route);
      },

      applyMealDecisionToRoute(event: {
        id: string;
        decision: any;
        option: any;
        optionNameInSpanish: string;
        optionNameInEnglish: string;
      }) {
        const updated = store.selectedRouteSupercenters().map((m: any) => {
          if (m.id === event.id) {
            const baseName = m.baseName ?? m.name;
            return {
              ...m,
              baseName,
              decision: event.decision,
              name: baseName,
              selectedFoodName: event.option.name,
              selectedFoodNameInEnglish: event.optionNameInEnglish,
              selectedFoodDisplayName: event.optionNameInSpanish,
              foodNameForApi: event.option.name,
              // ✅ AUTO-MARCAR COMO 'completed'
              status: 'completed',
              macros: event.option.macros,
            };
          }
          return m;
        });

        patchState(store, { selectedRouteSupercenters: updated });
      },

      updateSupercenterMealStatus(
        id: string,
        status: 'completed' | 'skipped' | 'pending',
        macros?: { protein: number; carbs: number; fats: number }
      ) {
        const updated = store.selectedRouteSupercenters().map((m: any) =>
          m.id === id ? { ...m, status, ...(macros ? { macros } : {}) } : m
        );
        patchState(store, { selectedRouteSupercenters: updated });
      },
    }))
  );
}
