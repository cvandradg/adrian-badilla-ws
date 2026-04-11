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
        component: DashboardSectionPlaceholderComponent,
        data: {
          title: 'Dietas',
          description:
            'Espacio reservado para planes de alimentación, seguimiento nutricional y organización de dietas.',
        },
      },
      {
        path: 'rutinas',
        title: 'Rutinas',
        loadChildren: () =>
          import('adrian-badilla/routines').then(
            (module) => module.routinesRoutes
          ),
      },
    ],
  },
];
