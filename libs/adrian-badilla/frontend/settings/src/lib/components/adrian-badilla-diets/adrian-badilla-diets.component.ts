import {
  Component,
  computed,
  signal,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { Timeline as PrimeTimeline } from 'primeng/timeline';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AdrianBadillaDietsDetailsComponent } from '../adrian-badilla-diets-details/adrian-badilla-diets-details.component';
import { settingsStoreDev } from '../../store/settings.store';
import { FoodDescriptionDialogComponent } from '../../dialog/food-description-dialog/food-description-dialog.component';
import {
  getMockRouteSupercenters,
  MOCK_ROUTES,
} from '../../mocks/adrian-badilla-diets.mock';
import type {
  RouteNavItem,
  RouteSupercenterItem,
  SupercenterDoc,
  WithId,
} from '../../types/diets.types';

@Component({
  selector: 'lib-adrian-badilla-diets',
  templateUrl: './adrian-badilla-diets.component.html',
  styleUrls: ['./adrian-badilla-diets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonModule,
    PrimeTimeline,
    InputIconModule,
    IconFieldModule,
    InputTextModule,
    FloatLabelModule,
    FontAwesomeModule,
    AdrianBadillaDietsDetailsComponent,
  ],
})
export class AdrianBadillaDietsComponent {

  settingsStoreDev = inject(settingsStoreDev)

  // 🔥 MOCK STORE
  settingsStore: any = {
    createRouteisLoading: signal(false),
    saveRouteisLoading: signal(false),
    routeSearchQuery: signal(''),

  
    routes: signal<RouteNavItem[]>(MOCK_ROUTES),

    selectedRoute: signal<RouteNavItem | null>(MOCK_ROUTES[0] ?? null),

    selectedRouteSupercenters: signal<RouteSupercenterItem[]>(
      getMockRouteSupercenters(MOCK_ROUTES[0]?.id ?? ''),
    ),

    sortedRoutes: computed(() => this.settingsStore.routes()),

    filteredRoutes: computed(() => {
      const query = this.settingsStore.routeSearchQuery().toLowerCase();
      return this.settingsStore
        .routes()
        .filter((r: any) => r.name.toLowerCase().includes(query));
    }),

    updateRouteSearchQuery: (query: string) => {
      this.settingsStore.routeSearchQuery.set(query);
    },

    clearRouteSearchQuery: () => {
      this.settingsStore.routeSearchQuery.set('');
    },

    selectRoute: (routeId: string) => {
      const route = this.settingsStore
        .routes()
        .find((r: any) => r.id === routeId);

      this.settingsStore.selectedRoute.set(route);

      this.settingsStore.selectedRouteSupercenters.set(
        getMockRouteSupercenters(routeId),
      );
    },

    saveRoute: (data: any) => {
      console.log('💾 Mock saveRoute', data);
    },

    openDialogToAddRoute: () => console.log('open add route'),
    openDialogToAddSupercenter: () => console.log('open add supercenter'),

    openDialogToEditRouteDiet: (_: any, id: string) =>
      console.log('edit diet', id),
    openDialogToDeleteRoute: (_: any, route: any) =>
      console.log('delete route', route),
  };

  // =========================

  isEditing = signal(false);

  createRouteisLoading = this.settingsStore.createRouteisLoading;
  saveRouteisLoading = this.settingsStore.saveRouteisLoading;
  routeSearchQuery = this.settingsStore.routeSearchQuery;
  sortedRoutes = this.settingsStore.sortedRoutes;
  filteredRoutes = this.settingsStore.filteredRoutes;
  selectedRoute = this.settingsStore.selectedRoute;
  selectedRouteSupercenters = this.settingsStore.selectedRouteSupercenters;

  isReadonly = computed(() => !this.isEditing());
  isSavingRoute = computed(
    () => this.createRouteisLoading() || this.saveRouteisLoading()
  );

  // 🔥 MOCK FORM FIELD
  private createMockField(initial: string) {
    const value = signal(initial);

    return Object.assign(() => value(), {
      set: (v: string) => value.set(v),
      dirty: () => false,
      invalid: () => false,
      errors: () => [],
    });
  }

  // 🔥 MOCK FORM COMPLETO
  routeForm = (() => {
    const routeName = this.createMockField(this.selectedRoute()?.name ?? '');

    const routeDescription = this.createMockField(
      this.selectedRoute()?.description ?? ''
    );

    const formFn = (() => formFn) as any;

    formFn.routeName = routeName;
    formFn.routeDescription = routeDescription;

    formFn.reset = (values: any) => {
      routeName.set(values.routeName);
      routeDescription.set(values.routeDescription);
    };

    return formFn;
  })();

  // =========================

  enableEditMode(): void {
    this.isEditing.set(true);
  }

  discardEditMode(): void {
    this.isEditing.set(false);
  }

  updateRouteSearchQuery(query: string): void {
    this.settingsStore.updateRouteSearchQuery(query);
  }

  clearRouteSearchQuery(input: HTMLInputElement): void {
    this.settingsStore.clearRouteSearchQuery();
    input.focus();
  }

  selectRoute(routeId: string): void {
    this.settingsStore.selectRoute(routeId);
  }

  openAddRouteDialog() {
    this.settingsStore.openDialogToAddRoute();
  }

  openAddSupercenterDialog() {
    this.settingsStore.openDialogToAddSupercenter();
  }

  openDietDialog(diet: RouteSupercenterItem): void {
    const fullDiet = {
      ...diet,
      createdDate: new Date(),
      lastModifiedDate: new Date(),
    } as WithId<SupercenterDoc>;
    this.settingsStoreDev.openDialogToEditDiet(
      FoodDescriptionDialogComponent,
      fullDiet,
    );
  }

  openDeleteRouteDialog(route: RouteNavItem): void {
    this.settingsStore.openDialogToDeleteRoute(null, route);
  }

  saveRoute(): void {
    const value = {
      routeName: this.routeForm.routeName(),
      routeDescription: this.routeForm.routeDescription(),
    };

    console.log('💾 MOCK SAVE', value);

    this.isEditing.set(false);
  }

  //testing dialog setting store.


}
