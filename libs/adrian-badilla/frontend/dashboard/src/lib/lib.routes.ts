import { Route } from '@angular/router';
import { DashboardComponent } from './adrian-badilla-ui-dashboard/adrian-badilla-ui-dashboard.component';
import { DashboardSectionPlaceholderComponent } from './section-placeholder/section-placeholder.component';

export const adrianBadillaDashboardRoutes: Route[] = [
  {
    path: '',
    title: 'Panel',
    component: DashboardComponent,
    children: [
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
        component: DashboardSectionPlaceholderComponent,
        data: {
          title: 'Rutinas',
          description:
            'Espacio reservado para programas de entrenamiento, bloques semanales y seguimiento de rutinas.',
        },
      },
    ],
  },
];
