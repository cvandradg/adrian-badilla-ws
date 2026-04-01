import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

type Mode = 'verifyEmail' | 'resetPassword';

export const firebaseActionGuard: CanActivateFn = (route) => {
  const router = inject(Router);

  const mode = route.queryParamMap.get('mode') as Mode | null;
  const oobCode = route.queryParamMap.get('oobCode');

  if (!mode || !oobCode) return true;

  if (mode === 'verifyEmail') {
    return router.createUrlTree(['/auth/email-verification'], {
      queryParams: { oobCode },
    });
  }

  if (mode === 'resetPassword') {
    return router.createUrlTree(['/auth/request-pass-reset'], {
      queryParams: { oobCode },
    });
  }

  return router.createUrlTree(['/auth/login']);
};
