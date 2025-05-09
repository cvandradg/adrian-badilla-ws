import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'landing-page',
    loadChildren: () => import('@adrian-badilla/ui/landing-page/routes'),
  },
];
