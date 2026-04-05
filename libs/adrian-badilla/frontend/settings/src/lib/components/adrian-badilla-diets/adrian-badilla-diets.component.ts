import {
  Component,
  computed,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { Timeline as PrimeTimeline } from 'primeng/timeline';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AdrianBadillaDietsDetailsComponent } from '../adrian-badilla-diets-details/adrian-badilla-diets-details.component';

export type WithId<T> = T & { id: string };
export type SupercenterDoc = {
  name: string;
  route: string;
  province: string;
  estimateLocation: string;
  exactLocation: string;
  createdDate: unknown;
  lastModifiedDate: unknown;
};

export type RouteNavItem = {
  id: string;
  name?: string;
  description?: string;
};


export type RouteSupercenterItem = Pick<
  WithId<SupercenterDoc>,
  'id' | 'name' | 'route' | 'province' | 'estimateLocation' | 'exactLocation'
> & {
  lastModifiedLabel: string | null;
};

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
    AdrianBadillaDietsDetailsComponent
  ],
})
export class AdrianBadillaDietsComponent {
  // 🔥 MOCK STORE
  settingsStore: any = {
    createRouteisLoading: signal(false),
    saveRouteisLoading: signal(false),
    routeSearchQuery: signal(''),

    routes: signal([
      { id: '1', name: 'Lunes', description: '6 de Abril 2026' },
      { id: '2', name: 'Martes', description: '7 de Abril 2026' },
      { id: '3', name: 'Miercoles', description: '8 de Abril 2026' },
      { id: '4', name: 'Jueves', description: '9 de Abril 2026' },
      { id: '5', name: 'Viernes', description: '10 de Abril 2026' },
      { id: '6', name: 'Sabado', description: '11 de Abril 2026' },
      { id: '7', name: 'Domingo', description: '12 de Abril 2026' },
    ]),

    selectedRoute: signal<any>({
      id: '1',
      name: 'Ruta 2',
      description: 'Ruta 2',
    }),

    selectedRouteSupercenters: signal<RouteSupercenterItem[]>([
      {
        id: '1',
        name: '3139',
        route: '1',
        province: 'Alajuela',
        estimateLocation: 'PALI POAS',
        exactLocation: '',
        lastModifiedLabel: '25/3/26, 1:19 a. m.',
      },
      {
        id: '2',
        name: '979',
        route: '1',
        province: 'Heredia',
        estimateLocation: 'PALI FRAIJANES',
        exactLocation: '',
        lastModifiedLabel: '25/3/26, 1:19 a. m.',
      },
    ]),

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
        routeId === '1'
          ? [
              {
                id: '1',
                name: '3139',
                route: '1',
                province: 'Alajuela',
                estimateLocation: 'PALI POAS',
                exactLocation: '',
                lastModifiedLabel: '25/3/26, 1:19 a. m.',
              },
              {
                id: '2',
                name: '979',
                route: '1',
                province: 'Heredia',
                estimateLocation: 'PALI FRAIJANES',
                exactLocation: '',
                lastModifiedLabel: '25/3/26, 1:19 a. m.',
              },
            ]
          : []
      );
    },

    saveRoute: (data: any) => {
      console.log('💾 Mock saveRoute', data);
    },

    openDialogToAddRoute: () => console.log('open add route'),
    openDialogToAddSupercenter: () =>
      console.log('open add supercenter'),
    openDialogToEditRouteSupercenter: (_: any, id: string) =>
      console.log('edit supercenter', id),
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
  selectedRouteSupercenters =
    this.settingsStore.selectedRouteSupercenters;

  isReadonly = computed(() => !this.isEditing());
  isSavingRoute = computed(
    () => this.createRouteisLoading() || this.saveRouteisLoading()
  );

  // 🔥 MOCK FORM FIELD
  private createMockField(initial: string) {
    const value = signal(initial);

    return Object.assign(
      () => value(),
      {
        set: (v: string) => value.set(v),
        dirty: () => false,
        invalid: () => false,
        errors: () => [],
      }
    );
  }

  // 🔥 MOCK FORM COMPLETO
  routeForm = (() => {
    const routeName = this.createMockField(
      this.selectedRoute()?.name ?? ''
    );

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

  openSupercenterDialog(supercenter: RouteSupercenterItem): void {
    this.settingsStore.openDialogToEditRouteSupercenter(
      null,
      supercenter.id
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
}