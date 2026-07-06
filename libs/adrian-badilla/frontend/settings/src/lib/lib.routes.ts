import { Route } from '@angular/router';
import { SettingsComponent } from './components/settings-overview/settings.component';

export const settingsRoutes: Route[] = [
  { path: '', component: SettingsComponent },
];

export const routinesRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./components/routines-page/routines-page.component').then(
        (m) => m.RoutinesPageComponent
      ),
  },
];
