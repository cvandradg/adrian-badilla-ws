import {
  Component,
  computed,
  signal,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  effect,
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
import { NgClass, CommonModule } from '@angular/common';
import { AdrianBadillaDietsDecisionComponent } from '../adrian-badilla-diets-decision/adrian-badilla-diets-decision.component';
import type { RouteNavItem } from '../../types/diets.types';
import { MacroProgressTrackerComponent } from '../macro-progress-tracker/macro-progress-tracker.component';

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
    RippleModule,
    MacroProgressTrackerComponent
    
],
})
export class AdrianBadillaDietsComponent {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly mealTranslationService = inject(MealTranslationService);
  private readonly store = inject(settingsStoreDev);

  isEditing = signal(false);

  // 📊 Exposed store signals
  readonly routeSearchQuery = computed(() => this.store.routeSearchQuery());
  readonly filteredRoutes = computed(() => this.store.filteredRoutes());
  readonly sortedRoutes = computed(() => this.store.routes());
  readonly selectedRoute = computed(() => this.store.selectedRoute());
  readonly selectedRouteSupercenters = computed(() => this.store.selectedRouteSupercenters());
  // ✅ USA selectedRouteSupercenters PARA SUMAR TODAS LAS 6 COMIDAS
  readonly mealsForMacroTracker = computed(() => this.store.selectedRouteSupercenters());
  readonly createRouteisLoading = computed(() => this.store.createRouteisLoading());
  readonly saveRouteisLoading = computed(() => this.store.saveRouteisLoading());

  // 🎯 Computed properties
  readonly isReadonly = computed(() => !this.isEditing());
  readonly isSavingRoute = computed(() => this.store.isSavingRoute());

  // 📝 Mock form - Using signals for reactivity
  private readonly routeNameSignal = signal('');
  private readonly routeDescriptionSignal = signal('');

  readonly routeForm = {
    routeName: computed(() => this.routeNameSignal()),
    routeDescription: computed(() => this.routeDescriptionSignal()),
    reset: (values: { routeName: string; routeDescription: string }) => {
      this.routeNameSignal.set(values.routeName);
      this.routeDescriptionSignal.set(values.routeDescription);
    }
  };

  constructor() {
    // Sync form values when selected route changes
    effect(() => {
      const selectedRoute = this.selectedRoute();
      if (selectedRoute) {
        this.routeNameSignal.set(selectedRoute.name ?? '');
        this.routeDescriptionSignal.set(selectedRoute.description ?? '');
      }
    });
  }

  // 🎬 UI Actions
  enableEditMode = () => this.isEditing.set(true);
  discardEditMode = () => this.isEditing.set(false);
  updateRouteSearchQuery = (query: string) => this.store.updateRouteSearchQuery(query);
  clearRouteSearchQuery = (input: HTMLInputElement) => {
    this.store.clearRouteSearchQuery();
    input.focus();
  };
  selectRoute = (routeId: string) => this.store.selectRoute(routeId);
  openAddRouteDialog = () => this.store.openDialogToAddRoute();
  openAddSupercenterDialog = () => this.store.openDialogToAddSupercenter();
  openDeleteRouteDialog = (route: RouteNavItem) => this.store.openDialogToDeleteRoute(null, route);

  saveRoute = () => {
    const value = {
      routeName: this.routeNameSignal(),
      routeDescription: this.routeDescriptionSignal(),
    };
    this.store.saveRoute(value);
    this.isEditing.set(false);
  };

  // 📊 Timeline & Visuals
  getConnectorClass = (index: number) => this.store.getConnectorClass(index);
  getConnectorColor = (index: number) => this.store.getConnectorColor(index);
  getMarkerAnimationClass = (item: any) => this.store.getMarkerAnimationClass(item);
  getMarkerClasses = (item: any, index: number) => this.store.getMarkerClasses(item, index);
  getNextPendingIndex = () => this.store.getNextPendingIndex();
  isNext = (index: number) => this.store.isNext(index);
  getProgressPercent = (index: number) => this.store.getProgressPercent(index);

  scrollToIndex = (index: number) => this.store.scrollToIndex(index);

  // 🍽️ Diet Dialogs
  openDietDialog = (supercenter: any) =>
    this.store.openDietDialog(
      supercenter,
      this.mealTranslationService,
      (comp, data) => this.store.openDialogToEditDiet(comp, data),
      FoodDescriptionDialogComponent
    );

  openDietDialogFromChild = (mealId: string) =>
    this.store.openDietDialogFromChild(
      mealId,
      () => this.selectedRouteSupercenters(),
      this.mealTranslationService,
      (comp, data) => this.store.openDialogToEditDiet(comp, data),
      FoodDescriptionDialogComponent
    );

  // 🧠 Decision & Meal Engine
  mapToMeal = (supercenter: any) => this.store.mapToMeal(supercenter);
  getDecisionOptionsForMeal = (baseName: string) => this.store.getDecisionOptionsForMeal(baseName);

  applyDecisionFromChild = (event: any) => {
    // Aplicar a meals
    this.store.applyMealDecision(event);
    // Aplicar a selectedRouteSupercenters (timeline)
    this.store.applyMealDecisionToRoute(event);

    this.cdr.detectChanges();

    requestAnimationFrame(() => {
      this.store.updateConnectorClasses();
    });
  };

  // 📝 Form input handlers
  onRouteNameChange = (value: string) => {
    this.routeNameSignal.set(value || '');
  };

  onRouteDescriptionChange = (value: string) => {
    this.routeDescriptionSignal.set(value || '');
  };
}
