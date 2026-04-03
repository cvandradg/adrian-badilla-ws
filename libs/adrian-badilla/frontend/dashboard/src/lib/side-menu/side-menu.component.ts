import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import {
  Component,
  computed,
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
})
export class SideMenuComponent {
  sideNavCollapsed = signal(false);
  @Input() set collapsed(val: boolean) {
    this.sideNavCollapsed.set(val);
  }
readonly menuItems = signal<MenuItem[]>([
  {
    icon: ['fas', 'telescope'],
    label: 'Inicio',
    route: '/dashboard',
    exact: true,
  },
  {
    icon: ['fas', 'bars'],
    label: 'Productos',
    route: '/dashboard/products',
    exact: false,
  },
  {
    icon: ['fas', 'bars'],
    label: 'Salir',
    route: '/',
    exact: false,
  }
]);

  profilePicSize = computed(() => (this.sideNavCollapsed() ? '32' : '100'));
}
