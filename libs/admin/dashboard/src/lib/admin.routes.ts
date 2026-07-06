import { Route } from '@angular/router';
import { AdminShellComponent } from './shell/admin-shell.component';

export const adminRoutes: Route[] = [
  {
    path: '',
    component: AdminShellComponent,
    children: [
      {
        path: '',
        title: 'Administrador',
        loadComponent: () =>
          import(
            './pages/admin-dashboard-page/admin-dashboard-page.component'
          ).then((m) => m.AdminDashboardPageComponent),
      },
      {
        path: 'exercise-library',
        title: 'Biblioteca de Ejercicios',
        loadChildren: () =>
          import('@admin/exercise-library/routes').then(
            (m) => m.exerciseLibraryRoutes
          ),
      },
      // ── Future admin modules (stub routes for extensibility) ──────────────
      // { path: 'routine-builder', ... }
      // { path: 'diet-library', ... }
      // { path: 'users', ... }
      // { path: 'analytics', ... }
      // { path: 'ai-management', ... }
      // { path: 'reports', ... }
      // { path: 'settings', ... }
    ],
  },
];
