import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { FirebaseAuthService } from '@adrian-badilla/ui/shared';

type MenuItem = {
  icon: [string, string];
  label: string;
  route: string;
  exact: boolean;
};

@Component({
  selector: 'adrian-badilla-side-menu',
  imports: [MatListModule, MatIconModule, RouterModule, FontAwesomeModule],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideMenuComponent {
  private readonly _authService = inject(FirebaseAuthService);
  private readonly _authUser = this._authService.currentUser;

  /** Accepts the collapsed state from the parent dashboard shell. */
  readonly collapsed = input(false);
  /**
   * `linkedSignal` keeps internal state in sync with the `collapsed` input,
   * while still allowing internal mutations (e.g. mobile auto-close).
   * Replaces the `@Input() set collapsed` + `signal` pattern.
   */
  readonly sideNavCollapsed = linkedSignal(() => this.collapsed());
  readonly menuItemSelected = output<void>();

  /** Display name — falls back to email prefix or generic label. */
  readonly displayName = computed(() => {
    const u = this._authUser();
    if (u?.displayName) return u.displayName;
    if (u?.email) return u.email.split('@')[0];
    return 'Atleta';
  });

  /** Photo URL when available. */
  readonly photoURL = computed(() => this._authUser()?.photoURL ?? null);

  /** Avatar initials (up to 2 chars, uppercase). */
  readonly initials = computed(() => {
    const name = this.displayName();
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  });

  readonly menuItems = signal<MenuItem[]>([
    {
      icon: ['far', 'house-tree'],
      label: 'Inicio',
      route: '/dashboard/inicio',
      exact: true,
    },
    {
      icon: ['fas', 'user'],
      label: 'Perfil',
      route: '/dashboard/perfil',
      exact: false,
    },
    {
      icon: ['fas', 'salad'],
      label: 'Dietas',
      route: '/dashboard/dietas',
      exact: false,
    },

    {
      icon: ['fas', 'dumbbell'],
      label: 'Rutinas',
      route: '/dashboard/rutinas',
      exact: false,
    },
    {
      icon: ['fas', 'shirt'],
      label: 'Accesorios',
      route: '/dashboard/accesorios',
      exact: false,
    },
    {
      icon: ['fas', 'capsule'],
      label: 'Suplementos',
      route: '/dashboard/suplementos',
      exact: false,
    },
    {
      icon: ['fas', 'hat-chef'],
      label: 'Cocina',
      route: '/dashboard/cocina',
      exact: false,
    },
    {
      icon: ['fas', 'sliders'],
      label: 'Configuración',
      route: '/dashboard/configuracion',
      exact: false,
    },
  ]);
}
