import { Route } from '@angular/router';
import { DashboardComponent } from './adrian-badilla-ui-dashboard/adrian-badilla-ui-dashboard.component';

export const adrianBadillaDashboardRoutes: Route[] = [
  {
    path: '',
    title: 'Panel',
    component: DashboardComponent,
    children: [
      {
        path: 'inicio',
        title: 'Inicio',
        loadChildren: () => import('@adrian-badilla/home').then(m => m.HOME_ROUTES)
      },
      {
        path: 'products',
        title: 'Productos',
        loadChildren: () =>
          import('adrian-badilla/products').then(
            (module) => module.productsRoutes
          ),
      },
      {
        path: 'dietas',
        title: 'Dietas',
        loadChildren: () =>
          import('../../../settings/src/lib/lib.routes').then(
            (module) => module.settingsRoutes
          ),
      },
      {
        path: 'rutinas',
        title: 'Rutinas',
        loadChildren: () =>
          import('../../../settings/src/lib/lib.routes').then(
            (module) => module.routinesRoutes
          ),
      },
    ],
  },
];
