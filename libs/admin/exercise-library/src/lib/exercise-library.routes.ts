import { Route } from '@angular/router';

export const exerciseLibraryRoutes: Route[] = [
  {
    path: '',
    title: 'Biblioteca de Ejercicios',
    loadComponent: () =>
      import(
        './pages/exercise-library-page/exercise-library-page.component'
      ).then((m) => m.ExerciseLibraryPageComponent),
  },
];
