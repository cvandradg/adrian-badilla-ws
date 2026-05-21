import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
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
export class NavbarComponent implements OnInit {
  isMenuOpen = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.isMenuOpen = false;
      });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }
}
