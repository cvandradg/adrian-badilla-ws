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
        loadChildren: () =>
          import('@adrian-badilla/home').then((m) => m.HOME_ROUTES),
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
          import('../../../settings/src/lib/settings.routes').then(
            (module) => module.settingsRoutes
          ),
      },
      {
        path: 'rutinas',
        title: 'Rutinas',
        loadChildren: () =>
          import('../../../settings/src/lib/settings.routes').then(
            (module) => module.routinesRoutes
          ),
      },
      {
        path: 'accesorios',
        title: 'Accesorios',
        loadComponent: () =>
          import('./accesorios/accesorios.component').then(
            (m) => m.AccesoriosComponent
          ),
      },
      {
        path: 'suplementos',
        title: 'Suplementos',
        loadComponent: () =>
          import('./suplementos/suplementos.component').then(
            (m) => m.SuplementosComponent
          ),
      },
      {
        path: 'cocina',
        title: 'Cocina',
        loadComponent: () =>
          import('./cocina-coming-soon/cocina-coming-soon.component').then(
            (m) => m.CocinaComingSoonComponent
          ),
      },
      {
        path: 'perfil',
        title: 'Perfil',
        loadComponent: () =>
          import('./pages/profile-page/profile-page.component').then(
            (m) => m.ProfilePageComponent
          ),
      },
      {
        path: 'configuracion',
        title: 'Configuración',
        loadComponent: () =>
          import(
            '../../../settings/src/lib/components/app-config-page/app-config-page.component'
          ).then((m) => m.AppConfigPageComponent),
      },
    ],
  },
];
