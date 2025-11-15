import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'adrian-badilla-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {}
