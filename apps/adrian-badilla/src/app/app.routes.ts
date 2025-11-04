import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadChildren: () => import('@adrian-badilla/ui/landing-page/routes'),
  },
  {
    path: '',
    loadChildren: () =>
      import('@adrian-badilla/auth').then((m) => m.adrianBadillaUiAuthRoutes),
  },
  { path: '**', redirectTo: '' },
];
