import { Route } from '@angular/router';
import { DashboardComponent } from './adrian-badilla-ui-dashboard/adrian-badilla-ui-dashboard.component';

export const adrianBadillaDashboardRoutes: Route[] = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      
      {
        path: 'products',
        title: 'Productos',
        loadChildren: () =>
          import('../../../products/src/lib/lib.routes').then(
            (m) => m.productsRoutes
          ),
      },
    ],
  },
];
