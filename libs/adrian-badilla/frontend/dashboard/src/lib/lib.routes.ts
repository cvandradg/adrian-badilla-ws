import { Route } from '@angular/router';
import { Component } from '@angular/core';
import { DashboardComponent } from './adrian-badilla-ui-dashboard/adrian-badilla-ui-dashboard.component';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  template: `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 50vh; width: 100%;">
      <div style="text-align: center; padding: 2rem; border-radius: 16px; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.07);">
        <h2 style="margin: 0 0 0.5rem 0; font-size: 1.5rem; font-weight: 600; color: #f1f5f9;">Próximamente</h2>
        <p style="margin: 0; font-size: 0.95rem; color: rgba(241, 245, 249, 0.6);">Esta sección está en desarrollo y estará disponible en breve.</p>
      </div>
    </div>
  `,
})
class PlaceholderComponent {}

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
      {
        path: 'accesorios',
        title: 'Accesorios',
        component: PlaceholderComponent,
      },
      {
        path: 'suplementos',
        title: 'Suplementos',
        component: PlaceholderComponent,
      },
      {
        path: 'cocina',
        title: 'Cocina',
        component: PlaceholderComponent,
      },
      {
        path: 'ayuda',
        title: 'Ayuda',
        component: PlaceholderComponent,
      },
    ],
  },
];
