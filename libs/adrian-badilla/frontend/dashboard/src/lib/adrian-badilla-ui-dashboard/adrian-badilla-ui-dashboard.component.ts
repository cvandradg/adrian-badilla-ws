import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { SideMenuComponent } from '../side-menu/side-menu.component';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, startWith } from 'rxjs';
import { DescriptionSidePanelComponent } from '../description-side-panel/description-side-panel.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BreakpointObserver } from '@angular/cdk/layout';


@Component({
  selector: 'adrian-badilla-dashboard',
  standalone: true,
  imports: [SideMenuComponent,RouterModule, MatSidenavModule,DescriptionSidePanelComponent,FontAwesomeModule],
  templateUrl: './adrian-badilla-ui-dashboard.component.html',
  styleUrl: './adrian-badilla-ui-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  readonly #router = inject(Router);


    private readonly bpState = toSignal(
    inject(BreakpointObserver).observe('(max-width:1681px)'),
    {
      initialValue: { matches: false, breakpoints: {} },
    },
  );

  readonly isNarrow = computed(() => this.bpState().matches);
  readonly collapsed = signal(false);
  readonly rightPinnedOpen = signal(true);

  readonly gap = computed(() => (this.isNarrow() ? '0' : '1.2rem'));

    readonly leftWidth = computed(() =>
    this.isNarrow() ? '260px' : this.collapsed() ? '6.062rem' : '14.625rem',
  );

    readonly rightWidth = computed(() =>
    this.isNarrow() ? '260px' : '14.625rem',
  );

    readonly marginLeft = computed(() =>
    this.isNarrow() ? '0' : `calc(${this.leftWidth()} + ${this.gap()})`,
  );

    readonly marginRight = computed(() =>
    this.isNarrow()
      ? '0'
      : this.rightPinnedOpen()
        ? `calc(${this.rightWidth()} + ${this.gap()})`
        : '0',
  );

    onMenuClick(left: MatSidenav) {
    return this.isNarrow()
      ? left.toggle()
      : this.collapsed.update((isCollapsed) => !isCollapsed);
  }

  onRightToggle(right: MatSidenav) {
    return this.isNarrow()
      ? right.toggle()
      : this.rightPinnedOpen.update((isPinnedOpen) => !isPinnedOpen);
  }

    private readonly navEnd = toSignal(
    this.#router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      startWith(null),
    ),
    { initialValue: null },
  );

  readonly headerTitle = computed(() => {
    this.navEnd();

    let r = this.#router.routerState.snapshot.root;
    while (r.firstChild) r = r.firstChild;

    return r.title ?? 'MoofyVIP';
  });

}
