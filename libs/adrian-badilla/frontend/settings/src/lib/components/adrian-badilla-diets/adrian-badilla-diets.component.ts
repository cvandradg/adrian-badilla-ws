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

export type WithId<T> = T & { id: string };
export type SupercenterDoc = {
  name: string;
  route: string;
  province: string;
  estimateLocation: string;
  exactLocation: string;
  createdDate: unknown;
  lastModifiedDate: unknown;
  imgPrimeng: string;
};

export type RouteNavItem = {
  id: string;
  name?: string;
  description?: string;
};

export type RouteSupercenterItem = Pick<
  WithId<SupercenterDoc>,
  | 'id'
  | 'name'
  | 'route'
  | 'province'
  | 'estimateLocation'
  | 'exactLocation'
  | 'imgPrimeng'
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
        name: 'DESAYUNO',
        route: '1',
        province: 'Alajuela',
        estimateLocation: 'Avena con Leche o bebida Vegetal',
        exactLocation: 'Oat',
        lastModifiedLabel: '6/4/26, 7:00 a. m.',
        imgPrimeng: 'pi pi-sun',
      },
      {
        id: '2',
        name: 'Snack de la mañana',
        route: '1',
        province: 'Heredia',
        estimateLocation: 'Yogurt narutal o griego, nueces o almendras',
        exactLocation: 'Natural Yogurt',
        lastModifiedLabel: '6/4/26, 10:00 a. m.',
        imgPrimeng: 'pi pi-heart',
      },
      {
        id: '3',
        name: 'ALMUERZO',
        route: '1',
        province: 'Heredia',
        estimateLocation:
          'Pollo, pescado o carne magra con arroz integral y aguacate',
        exactLocation: 'Chicken Breast',
        lastModifiedLabel: '6/4/26, 1:00 p. m.',
        imgPrimeng: 'pi pi-briefcase',
      },
      {
        id: '4',
        name: 'Snack Tarde',
        route: '1',
        province: 'Snack Tarde',
        estimateLocation: '1 Fruta, tostada integral con mantequilla de maní',
        exactLocation: 'whole wheat toast with peanut butter',
        lastModifiedLabel: '6/4/26, 4:00 p. m.',
        imgPrimeng: 'pi pi-sparkles',
      },
      {
        id: '5',
        name: 'CENA',
        route: '1',
        province: 'Heredia',
        estimateLocation:
          'Proteina ligera: pollo, atun o huevo, Vegetales cocidos',
        exactLocation: 'Tuna',
        lastModifiedLabel: '6/4/26, 7:00 p. m.',
        imgPrimeng: 'pi pi-moon',
      },
      {
        id: '6',
        name: 'Snack Opcional(si tienes hambre)',
        route: '1',
        province: 'Heredia',
        estimateLocation:
          'Yogurt o vaso de leche o un puñado de pequeño de frutos secos',
        exactLocation: 'Dried Fruits',
        lastModifiedLabel: '6/4/26, 9:00 p. m.',
        imgPrimeng: 'pi pi-clock',
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
                name: 'DESAYUNO',
                route: '1',
                province: 'Alajuela',
                estimateLocation: 'Avena con Leche o bebida Vegetal',
                exactLocation: 'Oat',
                lastModifiedLabel: '6/4/26, 7:00 a. m.',
                imgPrimeng: 'pi pi-sun',
              },
              {
                id: '2',
                name: 'Snack de la mañana',
                route: '1',
                province: 'Heredia',
                estimateLocation: 'Yogurt narutal o griego, nueces o almendras',
                exactLocation: 'Natural Yogurt',
                lastModifiedLabel: '6/4/26, 10:00 a. m.',
                imgPrimeng: 'pi pi-heart',
              },
              {
                id: '3',
                name: 'ALMUERZO',
                route: '1',
                province: 'Heredia',
                estimateLocation:
                  'Pollo, pescado o carne magra con arroz integral y aguacate',
                exactLocation: 'Chicken Breast',
                lastModifiedLabel: '6/4/26, 1:00 p. m.',
                imgPrimeng: 'pi pi-briefcase',
              },
              {
                id: '4',
                name: 'Snack Tarde',
                route: '1',
                province: 'Snack Tarde',
                estimateLocation:
                  '1 Fruta, tostada integral con mantequilla de maní',
                exactLocation: 'whole wheat toast with peanut butter',
                lastModifiedLabel: '6/4/26, 4:00 p. m.',
                imgPrimeng: 'pi pi-sparkles',
              },
              {
                id: '5',
                name: 'CENA',
                route: '1',
                province: 'Heredia',
                estimateLocation:
                  'Proteina ligera: pollo, atun o huevo, Vegetales cocidos',
                exactLocation: 'Tuna',
                lastModifiedLabel: '6/4/26, 7:00 p. m.',
                imgPrimeng: 'pi pi-moon',
              },
              {
                id: '6',
                name: 'Snack Opcional(si tienes hambre)',
                route: '1',
                province: 'Heredia',
                estimateLocation:
                  'Yogurt o vaso de leche o un puñado de pequeño de frutos secos',
                exactLocation: 'dried fruits',
                lastModifiedLabel: '6/4/26, 9:00 p. m.',
                imgPrimeng: 'pi pi-clock',
              },
            ]
          : []
      );
    },

    saveRoute: (data: any) => {
      console.log('💾 Mock saveRoute', data);
    },

    openDialogToAddRoute: () => console.log('open add route'),
    openDialogToAddSupercenter: () => console.log('open add supercenter'),

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

  openSupercenterDialog(supercenter: RouteSupercenterItem): void {
    const fullSupercenter = {
      ...supercenter,
      createdDate: new Date(),
      lastModifiedDate: new Date(),
    } as WithId<SupercenterDoc>;
    this.settingsStoreDev.openDialogToEditRouteSupercenter(FoodDescriptionDialogComponent, fullSupercenter)
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
