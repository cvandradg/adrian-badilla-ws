import {
  Component,
  computed,
  effect,
  signal,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
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
import { SkeletonLoaderComponent } from '@adrian-badilla/ui/shared';
import { PremiumBannerComponent, billingStore } from '@adrian-badilla/billing';
import { PendingPlanComponent } from '../pending-plan/pending-plan.component';
import { aiStore } from '@adrian-badilla/ai';

// Form state interface
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
    SkeletonLoaderComponent,
    PremiumBannerComponent,
    PendingPlanComponent,
  ],
})
export class AdrianBadillaDietsComponent {
  private readonly mealTranslationService = inject(MealTranslationService);
  private readonly store = inject(settingsStoreDev);
  private readonly billing = inject(billingStore);
  private readonly ai = inject(aiStore);

  /**
   * Load diet once when BOTH the store's userId and subscription are confirmed
   * active.  Reads store['_userId'] — the same signal that loadActiveDiet()
   * reads internally — so the effect re-runs when that signal transitions from
   * null to a value, preventing the silent early-return that left dietFetchDone
   * permanently false.
   */
  readonly #loadDietEffect = effect(() => {
    const userId = (this.store as any)['_userId']?.();
    const isSubscriptionActive = this.billing.isSubscriptionActive();
    const lastLoadedId = (this.store as any)['_lastLoadedDietId']?.();
    const noActiveDiet = this.store.noActiveDiet();

    if (!isSubscriptionActive) return;

    if (userId && !lastLoadedId && !noActiveDiet) {
      (this.store as any).loadActiveDiet();
    }
  });

  // --- Store signals (direct references, no computed wrappers) ---------------
  // NOTE: loadingDiet and noActiveDiet are intentionally NOT exposed as public
  // class members. The template uses the computed showPaywall / showPendingPlan /
  // showContent / isLoading signals exclusively.

  // ─── Display rules ────────────────────────────────────────────────────────

  /**
   * True when the subscription is fully active and the billing period is valid.
   * Source of truth for gating premium content in this component.
   */
  readonly isSubscriptionActive = computed(() =>
    this.billing.isSubscriptionActive()
  );

  /**
   * Combined loading: diet fetch in progress OR subscription state not yet resolved.
   * Also covers the window between subscription resolving and the effect firing
   * (dietFetchDone = false) to avoid any blank-state flash.
   * For non-premium users the inner condition short-circuits to false immediately.
   */
  readonly isLoading = computed(
    () =>
      this.billing.isSubscriptionLoading() ||
      (this.isSubscriptionActive() &&
        (this.store.loadingDiet() || !this.store.dietFetchDone()))
  );

  /** Regla 1: usuario no-premium → mostrar paywall. */
  readonly showPaywall = computed(() => !this.isSubscriptionActive());

  /**
   * Regla 3: usuario premium pero sin contenido todavía.
   * Cubre dos casos:
   *   a) Firestore no encontró ningún documento de dieta (noActiveDiet = true).
   *   b) El documento de dieta existe pero no tiene meals (routes vacías).
   * Requiere dietFetchDone para no dispararse mientras se está cargando.
   */
  readonly showPendingPlan = computed(
    () =>
      this.isSubscriptionActive() &&
      this.store.dietFetchDone() &&
      (this.store.noActiveDiet() || this.sortedRoutes().length === 0)
  );

  /** Regla 2: usuario premium con dieta y meals disponibles. */
  readonly showContent = computed(
    () =>
      this.isSubscriptionActive() &&
      this.store.dietFetchDone() &&
      !this.store.noActiveDiet() &&
      this.sortedRoutes().length > 0
  );
  readonly routeSearchQuery = this.store.routeSearchQuery;
  readonly filteredRoutes = this.store.filteredRoutes;
  readonly sortedRoutes = this.store.routes;
  readonly selectedRoute = this.store.selectedRoute;
  readonly selectedRouteSupercenters = this.store.selectedRouteSupercenters;
  readonly createRouteisLoading = this.store.createRouteisLoading;
  readonly saveRouteisLoading = this.store.saveRouteisLoading;
  readonly isSavingRoute = this.store.isSavingRoute;

  // --- UI state --------------------------------------------------------------
  readonly isEditing = signal<boolean>(false);

  private readonly routeFormState = signal<RouteFormState>({
    routeName: '',
    routeDescription: '',
  });

  readonly isReadonly = computed(() => !this.isEditing());

  /** Routes mapped to DayBase for the timeline shell. */
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

  readonly completedDayIds = computed(() => new Set<string>());

  readonly routeForm = computed(() => this.routeFormState());

  // --- Form management -------------------------------------------------------
  private updateFormState(updates: Partial<RouteFormState>) {
    this.routeFormState.update((current) => ({ ...current, ...updates }));
  }

  readonly onRouteNameChange = (value: string) =>
    this.updateFormState({ routeName: value || '' });

  readonly onRouteDescriptionChange = (value: string) =>
    this.updateFormState({ routeDescription: value || '' });

  // --- Edit mode -------------------------------------------------------------
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

  // --- Route management ------------------------------------------------------
  readonly updateRouteSearchQuery = (query: string) =>
    this.store.updateRouteSearchQuery(query);

  readonly clearRouteSearchQuery = (input: HTMLInputElement) => {
    this.store.clearRouteSearchQuery();
    input.focus();
  };

  readonly selectRoute = (routeId: string) => this.store.selectRoute(routeId);

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

  // --- Diet dialog -----------------------------------------------------------
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

  // --- Chat ------------------------------------------------------------------
  readonly openChatForMeal = (mealId: string) =>
    this.ai.openChatForMeal(mealId);

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
  };
}
