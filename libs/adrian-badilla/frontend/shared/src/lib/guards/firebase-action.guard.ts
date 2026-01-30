import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

type Mode = 'verifyEmail' | 'resetPassword';

export const firebaseActionGuard: CanActivateFn = (route) => {
  const router = inject(Router);

  const mode = route.queryParamMap.get('mode') as Mode | null;
  const oobCode = route.queryParamMap.get('oobCode');

  if (!mode || !oobCode) {
    return router.createUrlTree(['/']);
  }

  if (mode === 'verifyEmail') {
    return router.createUrlTree(['/email-verification'], {
      queryParams: { mode, oobCode },
    });
  }

  if (mode === 'resetPassword') {
    return router.createUrlTree(['/request-pass-reset'], {
      queryParams: { mode, oobCode },
    });
  }

  return router.createUrlTree(['/']);
};
