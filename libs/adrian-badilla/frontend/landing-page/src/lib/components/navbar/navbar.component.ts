import { Component, inject, linkedSignal } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'adrian-badilla-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  imports: [RouterModule, DrawerModule, ButtonModule, RippleModule],
})
export class NavbarComponent {
  private readonly router = inject(Router);

  /** Tracks completed navigations — used as a `linkedSignal` dependency. */
  readonly #navEnd = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ),
    { initialValue: null }
  );

  /**
   * `linkedSignal` resets to `false` on every navigation, but is freely
   * writable between events — no subscribe(), no ngOnInit, no ngOnDestroy.
   */
  readonly isMenuOpen = linkedSignal(() => {
    this.#navEnd(); // establish reactive dependency
    return false;
  });

  toggleMenu(): void {
    this.isMenuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }
}
