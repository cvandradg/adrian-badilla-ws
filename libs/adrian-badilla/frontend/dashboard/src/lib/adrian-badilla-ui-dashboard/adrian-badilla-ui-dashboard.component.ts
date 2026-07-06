import { BreakpointObserver } from '@angular/cdk/layout';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, startWith } from 'rxjs';
import { DescriptionSidePanelComponent } from '../description-side-panel/description-side-panel.component';
import { SideMenuComponent } from '../side-menu/side-menu.component';
import { ProfilePageComponent } from '../pages/profile-page/profile-page.component';
import { TourAnchorDirective } from '@adrian-badilla/ui/shared';
import { firebaseAuthStore, ProfileSetupComponent } from '@adrian-badilla/auth';

const DASHBOARD_MOBILE_WIDTH = 'var(--dashboard-panel-mobile-inline-size)';
const DASHBOARD_EXPANDED_WIDTH = 'var(--dashboard-panel-inline-size)';
const DASHBOARD_COLLAPSED_WIDTH =
  'var(--dashboard-panel-collapsed-inline-size)';
const DASHBOARD_SIDENAV_GAP = 'var(--dashboard-panel-gap)';

const DASHBOARD_NARROW_QUERY = '(max-width:1681px)';
const DASHBOARD_MOBILE_QUERY = '(max-width:760px)';
const DASHBOARD_COMPACT_LANDSCAPE_QUERY =
  '(orientation: landscape) and (max-height:560px) and (max-width:960px)';

@Component({
  selector: 'adrian-badilla-dashboard',
  standalone: true,
  imports: [
    SideMenuComponent,
    RouterModule,
    MatSidenavModule,
    MatDialogModule,
    DescriptionSidePanelComponent,
    FontAwesomeModule,
    TourAnchorDirective,
    ProfileSetupComponent,
  ],
  templateUrl: './adrian-badilla-ui-dashboard.component.html',
  styleUrl: './adrian-badilla-ui-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  readonly #router = inject(Router);
  readonly #dialog = inject(MatDialog);
  readonly #authStore = inject(firebaseAuthStore);

  readonly needsOnboarding = this.#authStore.needsOnboarding;

  private readonly bpState = toSignal(
    inject(BreakpointObserver).observe([
      DASHBOARD_NARROW_QUERY,
      DASHBOARD_MOBILE_QUERY,
      DASHBOARD_COMPACT_LANDSCAPE_QUERY,
    ]),
    {
      initialValue: {
        matches: false,
        breakpoints: {
          [DASHBOARD_NARROW_QUERY]: false,
          [DASHBOARD_MOBILE_QUERY]: false,
          [DASHBOARD_COMPACT_LANDSCAPE_QUERY]: false,
        },
      },
    }
  );

  readonly isNarrow = computed(
    () => this.bpState().breakpoints[DASHBOARD_NARROW_QUERY] ?? false
  );
  readonly isMobile = computed(
    () => this.bpState().breakpoints[DASHBOARD_MOBILE_QUERY] ?? false
  );
  readonly isCompactLandscape = computed(
    () => this.bpState().breakpoints[DASHBOARD_COMPACT_LANDSCAPE_QUERY] ?? false
  );
  readonly isCompact = computed(
    () => this.isMobile() || this.isCompactLandscape()
  );
  readonly collapsed = signal(false);
  readonly rightPinnedOpen = signal(true);
  readonly isScraperRunning = signal(false);

  readonly gap = computed(() =>
    this.isNarrow() ? '0' : DASHBOARD_SIDENAV_GAP
  );

  readonly expandedLeftWidth = computed(() =>
    this.collapsed() ? DASHBOARD_COLLAPSED_WIDTH : DASHBOARD_EXPANDED_WIDTH
  );

  readonly leftWidth = computed(() =>
    this.isNarrow() ? DASHBOARD_MOBILE_WIDTH : this.expandedLeftWidth()
  );

  readonly drawerHeight = computed(() =>
    this.isCompact() ? '100%' : 'fit-content'
  );

  readonly rightWidth = computed(() =>
    this.isNarrow() ? DASHBOARD_MOBILE_WIDTH : DASHBOARD_EXPANDED_WIDTH
  );

  readonly marginLeft = computed(() =>
    this.isNarrow() ? '0' : `calc(${this.leftWidth()} + ${this.gap()})`
  );

  readonly pinnedRightMargin = computed(() =>
    this.rightPinnedOpen() ? `calc(${this.rightWidth()} + ${this.gap()})` : '0'
  );

  readonly marginRight = computed(() =>
    this.isNarrow() ? '0' : this.pinnedRightMargin()
  );

  onMenuClick(left: MatSidenav): void {
    if (this.isNarrow()) return void left.toggle();
    this.collapsed.update((isCollapsed) => !isCollapsed);
  }

  onLeftNavigationItemSelected(left: MatSidenav): void {
    if (!this.isNarrow()) return;
    void left.close();
  }

  onRightToggle(right: MatSidenav) {
    return this.isNarrow()
      ? right.toggle()
      : this.rightPinnedOpen.update((isPinnedOpen) => !isPinnedOpen);
  }

  private readonly navEnd = toSignal(
    this.#router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      startWith(null)
    ),
    { initialValue: null }
  );

  onUserProfileClick(): void {
    this.#dialog.open(ProfilePageComponent, {
      panelClass: 'user-profile-dialog-panel',
      backdropClass: 'user-profile-dialog-backdrop',
      maxWidth: '100vw',
    });
  }

  readonly headerTitle = computed(() => {
    this.navEnd();

    let routeSnapshot = this.#router.routerState.snapshot.root;
    while (routeSnapshot.firstChild) routeSnapshot = routeSnapshot.firstChild;

    return routeSnapshot.title ?? 'Adrián Badilla';
  });
}
