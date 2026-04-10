import {
  Component,
  computed,
  signal,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
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
import { NgClass, CommonModule } from '@angular/common';
type MealStatus = 'pending' | 'completed' | 'skipped';

interface Meal {
  name: string;
  time: string;
  status: MealStatus;
}

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
    NgClass,
    CommonModule,
    RippleModule
],
})
export class AdrianBadillaDietsComponent {
  private cdr = inject(ChangeDetectorRef);
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

  updateStatus(item: any, status: MealStatus): void {
    const list = this.selectedRouteSupercenters();

    const updated = list.map((i: any) =>
      i === item ? { ...i, status } : i
    );

    this.selectedRouteSupercenters.set(updated);
    this.cdr.detectChanges();

    // Actualizar clases de los conectores de forma robusta
    requestAnimationFrame(() => {
      this.updateConnectorClasses();
      
      const nextIndex = updated.findIndex((i: any) => i.status !== 'completed');
      if (nextIndex !== -1) {
        this.scrollToIndex(nextIndex);
      }
    });
  }

  private updateConnectorClasses(): void {
    const list = this.selectedRouteSupercenters();
    const timelineEvents = document.querySelectorAll('.route-timeline .p-timeline-event');

    if (timelineEvents.length === 0) {
      requestAnimationFrame(() => this.updateConnectorClasses());
      return;
    }

    // Iterar sobre cada evento timeline en orden
    timelineEvents.forEach((event, i) => {
      // Si es el último item, no tiene conector después
      if (i >= list.length - 1) return;

      // El conector está dentro del mismo evento
      const connector = event.querySelector('.p-timeline-event-connector');
      
      if (!connector) return;

      const current = list[i];
      
      // Remover todas las clases
      connector.classList.remove('completed-line', 'skipped-line', 'pending-line');

      // La lógica correcta: colorea el conector basado en el estado ACTUAL del marker
      if (current.status === 'completed') {
        connector.classList.add('completed-line');
      } else if (current.status === 'skipped') {
        connector.classList.add('skipped-line');
      } else {
        // Si está pending, pero hay un skipped ANTES, sigue siendo pending (gris)
        const hasErrorBefore = list
          .slice(0, i)
          .some((item: any) => item.status === 'skipped');
        
        connector.classList.add(hasErrorBefore ? 'pending-line' : 'pending-line');
      }
    });
  }

getConnectorClass(index: number): string {
  const list = this.selectedRouteSupercenters();

  if (index === list.length - 1) return '';

  const current = list[index];

  // si hay algún anterior skipped → todo lo siguiente gris
  const hasErrorBefore = list
    .slice(0, index)
    .some((i:any) => i.status === 'skipped');

  if (hasErrorBefore) return 'pending-line';

  if (current.status === 'completed') return 'completed-line';
  if (current.status === 'skipped') return 'skipped-line';

  return 'pending-line';
}
  
  getConnectorColor(index: number): string {
  const connectorClass = this.getConnectorClass(index);
  
  if (connectorClass === 'completed-line') return '#22c55e';
  if (connectorClass === 'skipped-line') return '#ef4444';
  return '#374151'; // pending
}

  getMarkerAnimationClass(item: any): string {
    if (item.status === 'completed' || item.status === 'skipped') {
      return 'pulse-marker';
    }
    return '';
  }

  getMarkerClasses(item: any, index: number): any {
    return {
      'completed': item.status === 'completed',
      'skipped': item.status === 'skipped',
      'pending': item.status === 'pending',
      'next': this.isNext(index),
      'pulse-completed': item.status === 'completed',
      'pulse-skipped': item.status === 'skipped'
    };
  }
  scrollToIndex(index: number) {
  const elements = document.querySelectorAll('.timeline-marker');
  const el = elements[index] as HTMLElement;

  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
  
  getNextPendingIndex(): number {
  return this.selectedRouteSupercenters()
    .findIndex((i: any) => i.status !== 'completed');
  }
  
  isNext(index: number): boolean {
  return this.getNextPendingIndex() === index;
  }
  
  getProgressPercent(index: number): string {
  const list = this.selectedRouteSupercenters();
  const completedCount = list.filter((i:any) => i.status === 'completed').length;

  const percent = (completedCount / list.length) * 100;

  return `${percent}%`;
}

}
