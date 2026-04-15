import {
  signalStoreFeature,
  withState,
  withComputed,
  withMethods,
  patchState
} from '@ngrx/signals';
import { computed } from '@angular/core';
import { MOCK_ROUTES, getMockRouteSupercenters } from '../mocks/adrian-badilla-diets.mock';
import type { RouteNavItem, RouteSupercenterItem } from '../types/diets.types';

interface RoutesState {
  routes: RouteNavItem[];
  selectedRoute: RouteNavItem | null;
  selectedRouteSupercenters: RouteSupercenterItem[];
  routeSearchQuery: string;
  createRouteisLoading: boolean;
  saveRouteisLoading: boolean;
}

export function withRoutes() {
  return signalStoreFeature(
    withState<RoutesState>({
      routes: MOCK_ROUTES,
      selectedRoute: MOCK_ROUTES[0] ?? null,
      selectedRouteSupercenters: getMockRouteSupercenters(MOCK_ROUTES[0]?.id ?? ''),
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
          selectedRouteSupercenters: getMockRouteSupercenters(routeId),
        });
      },

      saveRoute(data: any) {
        console.log('💾 Mock saveRoute', data);
        patchState(store, { saveRouteisLoading: false });
      },

      openDialogToAddRoute() {
        console.log('open add route');
      },

      openDialogToAddSupercenter() {
        console.log('open add supercenter');
      },

      openDialogToEditRouteDiet(_: any, id: string) {
        console.log('edit diet', id);
      },

      openDialogToDeleteRoute(_: any, route: RouteNavItem) {
        console.log('delete route', route);
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
              exactLocation: event.option.name,
              // ✅ AUTO-MARCAR COMO 'completed'
              status: 'completed',
              macros: event.option.macros,
            };
          }
          return m;
        });

        patchState(store, { selectedRouteSupercenters: updated });
      },
    }))
  );
}
