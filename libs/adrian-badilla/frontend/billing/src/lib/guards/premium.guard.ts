import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { billingStore } from '../store/billing.store';

/**
 * premiumGuard
 *
 * Functional CanActivateFn that protects routes requiring an active
 * premium subscription. Redirects to /billing if the user is not premium.
 *
 * I-2: Waits for isSubscriptionLoading to resolve before evaluating isPremium.
 * Without this, a direct-URL navigation on page reload would evaluate isPremium
 * while subscription === undefined (initial state), incorrectly blocking access.
 *
 * Usage in routes:
 *   { path: 'some-feature', canActivate: [premiumGuard], ... }
 */
export const premiumGuard: CanActivateFn = () => {
  const store = inject(billingStore);
  const router = inject(Router);

  const resolve = () =>
    store.isPremium() ? true : router.createUrlTree(['/billing']);

  // If already loaded, evaluate immediately without creating an observable.
  if (!store.isSubscriptionLoading()) {
    return resolve();
  }

  // Still loading — wait for the onSnapshot to deliver the first value.
  return toObservable(store.isSubscriptionLoading).pipe(
    filter((loading) => !loading),
    take(1),
    map(resolve)
  );
};
