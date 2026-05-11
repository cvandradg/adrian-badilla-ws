import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';

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
  readonly sideNavCollapsed = signal(false);
  @Input() set collapsed(value: boolean) {
    this.sideNavCollapsed.set(value);
  }

  readonly menuItems = signal<MenuItem[]>([
    {
      icon: ['far', 'house-tree'],
      label: 'Inicio',
      route: '/dashboard/inicio',
      exact: true,
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
      route: '/dashboard/ayuda',
      exact: false,
    },
  ]);
}
