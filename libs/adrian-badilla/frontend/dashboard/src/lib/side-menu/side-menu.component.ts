import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Input,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, user } from '@angular/fire/auth';

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
  private readonly _auth = inject(Auth);
  private readonly _authUser = toSignal(user(this._auth), { initialValue: null });

  readonly sideNavCollapsed = signal(false);
  @Input() set collapsed(value: boolean) {
    this.sideNavCollapsed.set(value);
  }

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
      icon: ['fas', 'message-question'],
      label: 'Ayuda',
      route: '',
      exact: false,
    },

  ]);
}
