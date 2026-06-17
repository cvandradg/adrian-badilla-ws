import {
  Component,
  computed,
  effect,
  signal,
  ChangeDetectionStrategy,
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
import { SkeletonLoaderComponent } from '@adrian-badilla/ui/shared';
import { PremiumBannerComponent, billingStore } from '@adrian-badilla/billing';
import { PendingPlanComponent } from '../pending-plan/pending-plan.component';

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

  // --- Auth trigger ----------------------------------------------------------
  private readonly _auth = inject(Auth);
  private readonly _authUser = toSignal(user(this._auth), {
    initialValue: null,
  });

  /** Load diet once when authenticated — side effect belongs in effect(), not computed(). */
  readonly #loadDietEffect = effect(() => {
    const authUser = this._authUser();
    const lastLoadedId = (this.store as any)['_lastLoadedDietId']?.();
    const noActiveDiet = this.store.noActiveDiet();
    if (authUser?.uid && !lastLoadedId && !noActiveDiet) {
      (this.store as any).loadActiveDiet();
    }
  });

  // --- Store signals (direct references, no computed wrappers) ---------------
  // NOTE: loadingDiet and noActiveDiet are intentionally NOT exposed as public
  // class members. The template uses the computed showPaywall / showPendingPlan /
  // showContent / isLoading signals exclusively.

  // ─── Display rules ────────────────────────────────────────────────────────

  /**
   * Combined loading: diet fetch in progress OR subscription state not yet resolved.
   * Prevents a flash of the paywall before isPremium() is known.
   */
  readonly isLoading = computed(
    () => this.store.loadingDiet() || this.billing.isSubscriptionLoading()
  );

  /** Regla 1: usuario no-premium → mostrar paywall. */
  readonly showPaywall = computed(() => !this.billing.isPremium());

  /**
   * Regla 3: usuario premium pero sin dieta generada todavía.
   * Solo evalúa después de que el fetch ha terminado.
   */
  readonly showPendingPlan = computed(
    () => this.billing.isPremium() && this.store.noActiveDiet()
  );

  /** Regla 2: usuario premium con dieta disponible. */
  readonly showContent = computed(
    () => this.billing.isPremium() && !this.store.noActiveDiet()
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
  };
}
