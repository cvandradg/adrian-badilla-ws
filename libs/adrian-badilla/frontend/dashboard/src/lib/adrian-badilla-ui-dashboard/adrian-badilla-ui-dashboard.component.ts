import { MatSidenavModule } from '@angular/material/sidenav';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SideMenuComponent } from '../side-menu/side-menu.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'adrian-badilla-dashboard',
  standalone: true,
  imports: [SideMenuComponent,RouterModule, MatSidenavModule],
  templateUrl: './adrian-badilla-ui-dashboard.component.html',
  styleUrl: './adrian-badilla-ui-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {}
