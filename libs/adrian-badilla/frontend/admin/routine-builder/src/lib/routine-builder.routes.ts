import { Route } from '@angular/router';

export const routineBuilderRoutes: Route[] = [
  {
    path: '',
    title: 'Creador de Rutinas',
    loadComponent: () =>
      import(
        './pages/routine-builder-page/routine-builder-page.component'
      ).then((m) => m.RoutineBuilderPageComponent),
  },
  {
    path: ':id',
    title: 'Editor de Rutina',
    loadComponent: () =>
      import('./pages/routine-editor-page/routine-editor-page.component').then(
        (m) => m.RoutineEditorPageComponent
      ),
  },
];
