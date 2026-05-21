import { BreakpointObserver } from '@angular/cdk/layout';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
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
import { ProfilePageComponent } from '../profile-page/profile-page.component';

const DASHBOARD_MOBILE_WIDTH = 'var(--dashboard-panel-mobile-inline-size)';
const DASHBOARD_EXPANDED_WIDTH = 'var(--dashboard-panel-inline-size)';
const DASHBOARD_COLLAPSED_WIDTH =
  'var(--dashboard-panel-collapsed-inline-size)';
const DASHBOARD_SIDENAV_GAP = 'var(--dashboard-panel-gap)';

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
  ],
  templateUrl: './adrian-badilla-ui-dashboard.component.html',
  styleUrl: './adrian-badilla-ui-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  readonly #router = inject(Router);
  readonly #dialog = inject(MatDialog);

  private readonly bpState = toSignal(
    inject(BreakpointObserver).observe('(max-width:1681px)'),
    {
      initialValue: { matches: false, breakpoints: {} },
    }
  );

  readonly isNarrow = computed(() => this.bpState().matches);
  readonly collapsed = signal(false);
  readonly leftOpen = signal(false);
  readonly rightPinnedOpen = signal(true);
  readonly isScraperRunning = signal(false);

  readonly gap = computed(() =>
    this.isNarrow() ? '0' : DASHBOARD_SIDENAV_GAP
  );

  readonly leftWidth = computed(() =>
    this.isNarrow()
      ? DASHBOARD_MOBILE_WIDTH
      : this.collapsed()
      ? DASHBOARD_COLLAPSED_WIDTH
      : DASHBOARD_EXPANDED_WIDTH
  );

  readonly rightWidth = computed(() =>
    this.isNarrow() ? DASHBOARD_MOBILE_WIDTH : DASHBOARD_EXPANDED_WIDTH
  );

  readonly marginLeft = computed(() =>
    this.isNarrow() ? '0' : `calc(${this.leftWidth()} + ${this.gap()})`
  );

  readonly marginRight = computed(() =>
    this.isNarrow()
      ? '0'
      : this.rightPinnedOpen()
      ? `calc(${this.rightWidth()} + ${this.gap()})`
      : '0'
  );

  onMenuClick(): void {
    if (this.isNarrow()) {
      this.leftOpen.update((open) => !open);
    } else {
      this.collapsed.update((isCollapsed) => !isCollapsed);
    }
  }

  onBackdropClick(): void {
    if (this.isNarrow()) {
      this.leftOpen.set(false);
    }
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

  // Close mobile sidebar automatically on every route navigation
  private readonly _closeOnNav = effect(() => {
    if (this.navEnd() && this.isNarrow()) {
      this.leftOpen.set(false);
    }
  });

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
