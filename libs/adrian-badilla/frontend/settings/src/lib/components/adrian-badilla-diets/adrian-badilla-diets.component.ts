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
import { NgClass } from '@angular/common';
import { AdrianBadillaDietsDecisionComponent } from '../adrian-badilla-diets-decision/adrian-badilla-diets-decision.component';
import { NutritionChatComponent } from '../nutrition-chat/nutrition-chat.component';
import { DayTimelineShellComponent } from '@adrian-badilla/ui/shared';
import type { DayBase } from '@adrian-badilla/ui/shared';
import type { RouteNavItem } from '../../types/diets.types';
import { MacroProgressTrackerComponent } from '../macro-progress-tracker/macro-progress-tracker.component';

// Extract form state into a focused signal
interface RouteFormState {
  readonly routeName: string;
  readonly routeDescription: string;
}

@Component({
  selector: 'lib-adrian-badilla-diets',
  templateUrl: './adrian-badilla-diets.component.html',
  styleUrls: ['./adrian-badilla-diets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
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
    MacroProgressTrackerComponent,
    NutritionChatComponent,
    DayTimelineShellComponent,
  ],
})
export class AdrianBadillaDietsComponent {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly mealTranslationService = inject(MealTranslationService);
  private readonly store = inject(settingsStoreDev);

  // UI state
  readonly isEditing = signal<boolean>(false);

  // Form state - single signal instead of separate signals
  private readonly routeFormState = signal<RouteFormState>({
    routeName: '',
    routeDescription: '',
  });

  // Store-derived signals
  readonly routeSearchQuery = computed(() => this.store.routeSearchQuery());
  readonly filteredRoutes = computed(() => this.store.filteredRoutes());
  readonly sortedRoutes = computed(() => this.store.routes());
  readonly selectedRoute = computed(() => this.store.selectedRoute());
  readonly selectedRouteSupercenters = computed(() => this.store.selectedRouteSupercenters());
  readonly createRouteisLoading = computed(() => this.store.createRouteisLoading());
  readonly saveRouteisLoading = computed(() => this.store.saveRouteisLoading());
  readonly isSavingRoute = computed(() => this.store.isSavingRoute());

  // Computed UI state
  readonly isReadonly = computed(() => !this.isEditing());

  /** Routes mapped to DayBase for DayTimelineShellComponent. */
  readonly routeDays = computed<DayBase[]>(() =>
    this.filteredRoutes().map((route) => ({
      id: route.id,
      label: route.name ?? '',
      date: route.description ?? '',
    }))
  );

  readonly isTimelineComplete = computed(() => {
    const supercenters = this.selectedRouteSupercenters();
    if (!supercenters.length) return false;
    return supercenters.every((meal: any) => meal.status === 'completed');
  });

  // Extracted form accessors for cleaner template binding
  readonly routeForm = computed(() => this.routeFormState());

  constructor() {
    // Sync form state when selected route changes
    effect(() => {
      const selectedRoute = this.selectedRoute();
      if (selectedRoute) {
        this.updateFormState({
          routeName: selectedRoute.name ?? '',
          routeDescription: selectedRoute.description ?? '',
        });
      }
    });
  }

  // Form management - immutable updates
  private updateFormState(updates: Partial<RouteFormState>) {
    this.routeFormState.update(current => ({
      ...current,
      ...updates,
    }));
  }

  readonly onRouteNameChange = (value: string) => {
    this.updateFormState({ routeName: value || '' });
  };

  readonly onRouteDescriptionChange = (value: string) => {
    this.updateFormState({ routeDescription: value || '' });
  };

  // Edit mode actions
  readonly enableEditMode = () => this.isEditing.set(true);
  readonly discardEditMode = () => this.isEditing.set(false);

  readonly saveRoute = () => {
    const form = this.routeFormState();
    this.store.saveRoute({
      routeName: form.routeName,
      routeDescription: form.routeDescription,
    });
    this.isEditing.set(false);
  };

  // Route management actions
  readonly updateRouteSearchQuery = (query: string) => this.store.updateRouteSearchQuery(query);
  readonly clearRouteSearchQuery = (input: HTMLInputElement) => {
    this.store.clearRouteSearchQuery();
    input.focus();
  };
  readonly selectRoute = (routeId: string) => this.store.selectRoute(routeId);
  readonly openAddRouteDialog = () => {
    console.log('💭 TODO: Implement add route dialog');
  };
  readonly openAddSupercenterDialog = () => {
    console.log('💭 TODO: Implement add supercenter dialog');
  };
  readonly openDeleteRouteDialog = (route: RouteNavItem) => {
    console.log('🗑️ TODO: Implement delete route dialog', route);
  };

  // Timeline visualization (delegate to store)
  readonly getConnectorClass = (index: number) => this.store.getConnectorClass(index);
  readonly getConnectorColor = (index: number) => this.store.getConnectorColor(index);
  readonly getMarkerAnimationClass = (item: any) => this.store.getMarkerAnimationClass(item);
  readonly getMarkerClasses = (item: any, index: number) => this.store.getMarkerClasses(item, index);
  readonly getNextPendingIndex = () => this.store.getNextPendingIndex();
  readonly isNext = (index: number) => this.store.isNext(index);
  readonly getProgressPercent = (index: number) => this.store.getProgressPercent(index);
  readonly scrollToIndex = (index: number) => this.store.scrollToIndex(index);

  // Diet dialog management
  readonly openDietDialog = (supercenter: any) =>
    this.store.openDietDialog(
      supercenter,
      this.mealTranslationService,
      FoodDescriptionDialogComponent
    );

  readonly openDietDialogFromChild = (mealId: string) =>
    this.store.openDietDialogFromChild(
      mealId,
      () => this.selectedRouteSupercenters(),
      this.mealTranslationService,
      FoodDescriptionDialogComponent
    );

  // Meal decision & mapping
  readonly mapToMeal = (supercenter: any) => this.store.mapToMeal(supercenter);
  readonly getDecisionOptionsForMeal = (baseName: string) =>
    this.store.getDecisionOptionsForMeal(baseName);

  readonly applyDecisionFromChild = (event: any) => {
    this.store.applyMealDecision(event);
    this.store.applyMealDecisionToRoute(event);
    this.cdr.detectChanges();

    requestAnimationFrame(() => {
      this.store.updateConnectorClasses();
    });
  };

  // Chat integration
  readonly openChatForMeal = (mealId: string) => this.store.openChatForMeal(mealId);

  readonly handleStatusChange = (event: { id: string; status: 'completed' | 'skipped' | 'pending'; macros?: { protein: number; carbs: number; fats: number } }) => {
    this.store.updateSupercenterMealStatus(event.id, event.status, event.macros);
    this.cdr.detectChanges();
    requestAnimationFrame(() => {
      this.store.updateConnectorClasses();
    });
  };
}
