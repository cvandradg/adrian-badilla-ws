import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'adrian-badilla';

  private readonly router = inject(Router);

  constructor() {
    // The purple "AB" chrome background belongs to the in-app routes (auth,
    // dashboard). The public landing stays a pure dark surface, so we only add
    // the `app-chrome` class — which paints that background (see _base.scss) —
    // while those routes are active.
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd)
      )
      .subscribe((event) => {
        const inAppChrome = /^\/(auth|dashboard)\b/.test(event.urlAfterRedirects);
        document.body.classList.toggle('app-chrome', inAppChrome);
      });
  }
}
