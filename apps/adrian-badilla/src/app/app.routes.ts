import { Route } from '@angular/router';
import { adrianBadillaUiDashboardRoutes } from 'adrian-badilla/dashboard';

export const appRoutes: Route[] = [
  {
    path: 'adrian-badilla-ui-dashboard',
    children: adrianBadillaUiDashboardRoutes,
  },
  {
    path: '',
    loadChildren: () => import('@adrian-badilla/ui/landing-page/routes'),
  },
  {
    path: '',
    loadChildren: () => import('@adrian-badilla/auth/routes'),
  },
  { path: '**', redirectTo: '' },
];
