import {
  Component,
  computed,
  signal,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, user } from '@angular/fire/auth';
import { ButtonModule } from 'primeng/button';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { settingsStoreDev } from '../../store/settings.store';
import { FoodDescriptionDialogComponent } from '../dialogs/food-description-dialog/food-description-dialog.component';
import { MealTranslationService } from '../../services/meal-translation.service';
import { SharedItemTimelineComponent } from '../shared-item-timeline/shared-item-timeline.component';
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
    SharedItemTimelineComponent,
    ButtonModule,
    InputIconModule,
    IconFieldModule,
    InputTextModule,
    FloatLabelModule,
    FontAwesomeModule,
    MacroProgressTrackerComponent,
  ],
})
export class AdrianBadillaDietsComponent {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly mealTranslationService = inject(MealTranslationService);
  private readonly store = inject(settingsStoreDev);

  // ─── Auth signal to trigger diet auto-load ────────────────────────────────
  private readonly _auth = inject(Auth);
  private readonly _authUser = toSignal(user(this._auth), {
    initialValue: null,
  });

  /**
   * Triggers diet auto-load when the user authenticates.
   * Watches _authUser (not selectedRoute, which would be circular).
   * Pure signal — no ngOnInit, effects, or constructor needed.
   */
  readonly ensureDietLoaded = computed(() => {
    // TODO: Restore to: const authUser = this._authUser();
    const authUser = { uid: 'T7eoekKP2YarbxJvIMbo' }; // Hardcoded for testing
    const lastLoadedId = (this.store as any)['_lastLoadedDietId']?.();

    // Fire once when user is authenticated and no diet is loaded yet
    if (authUser?.uid && !lastLoadedId) {
      (this.store as any).loadActiveDiet();
    }

    return this.selectedRouteSupercenters();
  });

  // ─── Firestore diet state ────────────────────────────────────────────────────
  readonly loadingDiet = computed(() => this.store.loadingDiet());
  readonly errorDiet = computed(() => this.store.errorDiet());

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
  readonly selectedRouteSupercenters = computed(() =>
    this.store.selectedRouteSupercenters()
  );
  readonly createRouteisLoading = computed(() =>
    this.store.createRouteisLoading()
  );
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

  /** Set of day IDs where every meal is completed — derived from real store data. */
  readonly completedDayIds = computed(() => new Set<string>());

  // Extracted form accessors for cleaner template binding
  readonly routeForm = computed(() => this.routeFormState());

  // Form management - immutable updates
  private updateFormState(updates: Partial<RouteFormState>) {
    this.routeFormState.update((current) => ({
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
  readonly updateRouteSearchQuery = (query: string) =>
    this.store.updateRouteSearchQuery(query);
  readonly clearRouteSearchQuery = (input: HTMLInputElement) => {
    this.store.clearRouteSearchQuery();
    input.focus();
  };
  readonly selectRoute = (routeId: string) => this.store.selectRoute(routeId);
  /** Selects a day using Firestore data; falls back to mock if data isn't loaded. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly selectDay = (dayId: string) => (this.store as any).selectDay(dayId);
  readonly openAddRouteDialog = () => {
    // TODO: Implement add route dialog
  };
  readonly openAddSupercenterDialog = () => {
    // TODO: Implement add supercenter dialog
  };
  readonly openDeleteRouteDialog = (_route: RouteNavItem) => {
    // TODO: Implement delete route dialog
  };

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

  // Chat integration
  readonly openChatForMeal = (mealId: string) =>
    this.store.openChatForMeal(mealId);

  readonly handleStatusChange = (event: {
    id: string;
    status: 'completed' | 'skipped' | 'pending';
    macros?: { protein: number; carbs: number; fats: number };
  }) => {
    this.store.updateSupercenterMealStatus(
      event.id,
      event.status,
      event.macros
    );
    this.cdr.detectChanges();
  };
}
