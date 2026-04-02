import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
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
  sideNavCollapsed = signal(false);
  menuItems = signal<MenuItem[]>([
    {
      icon: ['fal', 'house-tree'],
      label: 'Inicio',
      route: '/dashboard',
      exact: true,
    },
    {
      icon: ['fal', 'money-check-pen'],
      label: 'Productos',
      route: '/dashboard/products',
      exact: false,
    },

    {
      icon: ['fal', 'money-check-pen'],
      label: 'Salir',
      route: '/',
      exact: false,
    },

  ]);

  profilePicSize = computed(() => (this.sideNavCollapsed() ? '32' : '100'));
}
