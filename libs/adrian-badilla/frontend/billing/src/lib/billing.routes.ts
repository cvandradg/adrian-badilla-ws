import { Route } from '@angular/router';

export const billingRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/subscription-page/subscription-page.component').then(
        (m) => m.SubscriptionPageComponent
      ),
  },
  {
    path: 'payment',
    loadComponent: () =>
      import('./components/payment-form/payment-form.component').then(
        (m) => m.PaymentFormComponent
      ),
  },
  {
    path: 'return',
    loadComponent: () =>
      import(
        './pages/checkout-return-page/checkout-return-page.component'
      ).then((m) => m.CheckoutReturnPageComponent),
  },
];
