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
import { MealTranslationService } from '../../services/meal-translation.service';
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
import type {
  DietMeal,
  MealDecision,
  MealOption,
} from '../../types/diet-decision.types';
import { NgClass, CommonModule } from '@angular/common';
import { AdrianBadillaDietsDecisionComponent } from '../adrian-badilla-diets-decision/adrian-badilla-diets-decision.component';
type MealStatus = 'pending' | 'completed' | 'skipped';

type MealCategory =
  | 'breakfast'
  | 'morning-snack'
  | 'lunch'
  | 'afternoon-snack'
  | 'dinner'
  | 'night-snack';

const mealOption = (
  name: string,
  protein: number,
  carbs: number,
  fats: number,
): MealOption => ({
  name,
  macros: { protein, carbs, fats },
});

const MEAL_OPTIONS_BY_CATEGORY: Record<MealCategory, Record<MealDecision, MealOption[]>> = {
  breakfast: {
    light: [
      mealOption('Yogurt griego con fresas', 18, 14, 6),
      mealOption('Batido verde con proteina', 22, 12, 5),
      mealOption('Claras con espinaca', 20, 8, 4),
    ],
    balanced: [
      mealOption('Avena con banano y nueces', 20, 30, 10),
      mealOption('Tostadas integrales con huevo', 24, 28, 11),
      mealOption('Pancakes de avena', 21, 32, 9),
    ],
    'high-protein': [
      mealOption('Omelette de pavo y queso', 32, 10, 14),
      mealOption('Bowl de yogurt con whey', 35, 18, 8),
      mealOption('Huevos revueltos con pollo', 34, 9, 12),
    ],
  },
  'morning-snack': {
    light: [
      mealOption('Pepino con hummus', 8, 12, 5),
      mealOption('Fresas con yogurt light', 10, 14, 4),
      mealOption('Manzana con canela', 4, 18, 3),
    ],
    balanced: [
      mealOption('Yogurt con granola', 15, 24, 8),
      mealOption('Banano con mantequilla de mani', 12, 22, 9),
      mealOption('Sandwich mini de pavo', 16, 20, 7),
    ],
    'high-protein': [
      mealOption('Shake de proteina', 28, 10, 5),
      mealOption('Rollitos de pavo y queso', 24, 6, 8),
      mealOption('Cottage con almendras', 26, 9, 10),
    ],
  },
  lunch: {
    light: [
      mealOption('Ensalada de atun', 24, 16, 9),
      mealOption('Pollo con vegetales salteados', 27, 18, 8),
      mealOption('Wrap de lechuga con pavo', 25, 14, 7),
    ],
    balanced: [
      mealOption('Pollo con arroz integral', 30, 34, 11),
      mealOption('Carne magra con pure', 29, 32, 12),
      mealOption('Salmon con quinoa', 28, 30, 14),
    ],
    'high-protein': [
      mealOption('Pechuga con camote y broccoli', 38, 24, 10),
      mealOption('Bowl de res con arroz', 40, 22, 12),
      mealOption('Tilapia con lentejas', 36, 20, 9),
    ],
  },
  'afternoon-snack': {
    light: [
      mealOption('Gelatina light con yogurt', 12, 10, 3),
      mealOption('Palitos de apio con dip', 9, 11, 4),
      mealOption('Kiwi con semillas', 7, 13, 5),
    ],
    balanced: [
      mealOption('Tostada integral con aguacate', 11, 20, 9),
      mealOption('Yogurt con fruta', 14, 22, 6),
      mealOption('Queso cottage con galletas de arroz', 16, 19, 5),
    ],
    'high-protein': [
      mealOption('Batido de proteina con cacao', 30, 12, 6),
      mealOption('Huevos duros con pavo', 26, 4, 9),
      mealOption('Yogurt griego con whey', 32, 11, 4),
    ],
  },
  dinner: {
    light: [
      mealOption('Crema de vegetales con pollo', 20, 14, 7),
      mealOption('Pescado blanco con ensalada', 24, 12, 8),
      mealOption('Tortilla de claras con hongos', 22, 10, 6),
    ],
    balanced: [
      mealOption('Pollo con quinoa y vegetales', 28, 26, 10),
      mealOption('Tacos integrales de res', 27, 28, 11),
      mealOption('Pasta integral con atun', 25, 30, 9),
    ],
    'high-protein': [
      mealOption('Salmon con espinaca', 34, 12, 15),
      mealOption('Pollo grillado con huevo', 37, 10, 12),
      mealOption('Carne magra con esparragos', 36, 11, 13),
    ],
  },
  'night-snack': {
    light: [
      mealOption('Leche de almendra con chia', 8, 10, 4),
      mealOption('Infusion con yogurt light', 10, 9, 3),
      mealOption('Gelatina zero con queso cottage', 12, 8, 2),
    ],
    balanced: [
      mealOption('Yogurt con avena', 14, 18, 5),
      mealOption('Fruta con nueces', 9, 20, 8),
      mealOption('Tostada integral con ricotta', 13, 16, 6),
    ],
    'high-protein': [
      mealOption('Caseina con agua', 27, 5, 2),
      mealOption('Yogurt griego con mani', 24, 8, 7),
      mealOption('Queso cottage proteico', 26, 6, 4),
    ],
  },
};

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
    AdrianBadillaDietsDecisionComponent,
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
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly mealTranslationService = inject(MealTranslationService);
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
    // Usar el nombre en inglés si fue seleccionado, de lo contrario usar el nombre original
    const foodNameForApi = diet.selectedFoodNameInEnglish || 
                          this.mealTranslationService.translateMealToEnglish(diet.name) ||
                          diet.name;
    
    // Usar el nombre en español para mostrar en el título del dialog
    const foodDisplayName = diet.selectedFoodDisplayName || diet.selectedFoodName || diet.name;
    
    const fullDiet = {
      ...diet,
      name: foodNameForApi,
      displayName: foodDisplayName,
      createdDate: new Date(),
      lastModifiedDate: new Date(),
    } as WithId<SupercenterDoc>;
    this.settingsStoreDev.openDialogToEditDiet(
      FoodDescriptionDialogComponent,
      fullDiet,
    );
  }

  openDietDialogFromChild(mealId: string): void {
    const meal = this.selectedRouteSupercenters().find((item: any) => item.id === mealId);

    if (meal) {
      this.openDietDialog(meal);
    }
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

      // Remover todas las clases
      connector.classList.remove('completed-line', 'skipped-line', 'pending-line', 'balanced-line');

      // Aplicar clase basada en getConnectorClass
      const connectorClass = this.getConnectorClass(i);
      if (connectorClass) {
        connector.classList.add(connectorClass);
      }
    });
  }

getConnectorClass(index: number): string {
  const list = this.selectedRouteSupercenters();

  if (index === list.length - 1) return '';

  const current = list[index];

  // si hay algún anterior skipped, el resto queda en gris
  const hasErrorBefore = list
    .slice(0, index)
    .some((i:any) => i.status === 'skipped');

  if (hasErrorBefore) return 'pending-line';

  if (current.status === 'completed') return 'completed-line';
  if (current.status === 'skipped') return 'skipped-line';

  // Si tiene decision seleccionada (pendiente), colorear por tipo de decisión
  if (current.status === 'pending' && current.decision) {
    if (current.decision === 'light') return 'completed-line'; // Verde
    if (current.decision === 'balanced') return 'balanced-line'; // Amarillo
    if (current.decision === 'high-protein') return 'skipped-line'; // Rojo
  }

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
  const classes: any = {
    completed: item.status === 'completed',
    skipped: item.status === 'skipped',
    pending: item.status === 'pending',
    next: this.isNext(index),
  };

  // Agregar clase de color basada en decision si el item está pendiente
  if (item.status === 'pending' && item.decision) {
    if (item.decision === 'light') {
      classes['decision-light'] = true;
    } else if (item.decision === 'balanced') {
      classes['decision-balanced'] = true;
    } else if (item.decision === 'high-protein') {
      classes['decision-protein'] = true;
    }
  }

  return classes;
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
  
  // FUNCIONES DEL ENGINE

mapToMeal(supercenter: any): DietMeal {
  const baseName = supercenter.baseName ?? supercenter.name;

  return {
    id: supercenter.id,
    baseName,
    name: supercenter.name,
    time: '08:00',
    status: supercenter.status ?? 'pending',
    decision: supercenter.decision ?? null,
    selectedFoodName: supercenter.selectedFoodName ?? null,
    decisionOptions: this.getDecisionOptionsForMeal(baseName),
    macros: supercenter.macros ?? {
      protein: 20,
      carbs: 30,
      fats: 10
    }
  };
}
  
  updateStatusFromChild(event: any) {
  this.updateStatus(
    this.selectedRouteSupercenters().find((m:any) => m.id === event.id),
    event.status
    );
      console.log('🔥 EVENTO RECIBIDO', event);
}

applyDecisionFromChild(event: {
  id: string;
  decision: MealDecision;
  option: MealOption;
  optionNameInSpanish: string;
  optionNameInEnglish: string;
}) {
  const updated = this.selectedRouteSupercenters().map((m: any) => {
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
        macros: event.option.macros,
      };
    }
    return m;
  });

  this.selectedRouteSupercenters.set(updated);
  this.cdr.detectChanges();

  // PrimeNG reconstruye eventos del timeline al actualizar decisiones;
  // volvemos a aplicar clases del conector para evitar huecos visuales.
  requestAnimationFrame(() => {
    this.updateConnectorClasses();
  });
}

getDecisionOptionsForMeal(baseName: string): Record<MealDecision, MealOption[]> {
  const normalized = baseName.toLowerCase();

  if (normalized.includes('desayuno')) {
    return MEAL_OPTIONS_BY_CATEGORY.breakfast;
  }

  if (normalized.includes('manana')) {
    return MEAL_OPTIONS_BY_CATEGORY['morning-snack'];
  }

  if (normalized.includes('almuerzo')) {
    return MEAL_OPTIONS_BY_CATEGORY.lunch;
  }

  if (normalized.includes('tarde')) {
    return MEAL_OPTIONS_BY_CATEGORY['afternoon-snack'];
  }

  if (normalized.includes('cena')) {
    return MEAL_OPTIONS_BY_CATEGORY.dinner;
  }

  return MEAL_OPTIONS_BY_CATEGORY['night-snack'];
}

}
