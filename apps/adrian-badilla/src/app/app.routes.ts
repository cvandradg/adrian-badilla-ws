import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'shared',
    loadChildren: () =>
      import('@ab/shared').then((m) => m.adrianBadillaUiSharedRoutes),
  },
];
