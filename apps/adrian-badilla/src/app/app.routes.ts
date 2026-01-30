import { Route } from '@angular/router';
import { firebaseActionGuard } from '@adrian-badilla/auth/guards/firebase-action.guard';

export const appRoutes: Route[] = [
  {
    path: 'auth',
    canActivate: [firebaseActionGuard],
    children: [],
  },

  {
    path: '',
    loadChildren: () => import('@adrian-badilla/ui/landing-page/routes'),
  },
  {
    path: '',
    loadChildren: () => import('@adrian-badilla/auth/routes'),
  },
  {
    path: 'dashboard',
    loadChildren: () => import('@adrian-badilla/dashboard/routes'),
  },
  { path: '**', redirectTo: '' },
];
