import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'landing-page',
    loadChildren: () =>
      import('@ab/landing-page').then(
        (m) => m.adrianBadillaUiLandingPageRoutes
      ),
  },
  {
    path: 'shared',
    loadChildren: () =>
      import('@ab/shared').then((m) => m.adrianBadillaUiSharedRoutes),
  },
];
