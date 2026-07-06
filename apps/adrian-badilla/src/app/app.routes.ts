import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'settings',
    loadChildren: () =>
      import('adrian-badilla/settings/routes').then((m) => m.settingsRoutes),
  },
  {
    path: '',
    loadChildren: () => import('@adrian-badilla/ui/landing-page/routes'),
  },
  {
    path: 'auth',
    loadChildren: () => import('@adrian-badilla/auth/routes'),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('@adrian-badilla/dashboard/routes').then(
        (m) => m.adrianBadillaDashboardRoutes
      ),
  },

  {
    path: 'billing',
    loadChildren: () =>
      import('@adrian-badilla/billing/routes').then((m) => m.billingRoutes),
  },
  { path: '**', redirectTo: '' },
];
