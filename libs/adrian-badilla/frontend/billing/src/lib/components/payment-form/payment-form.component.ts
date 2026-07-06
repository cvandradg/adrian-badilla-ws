import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import {
  PrimaryAnimatedButtonComponent,
  StatusMessageComponent,
} from '@adrian-badilla/ui/shared';
import { billingStore } from '../../store/billing.store';

/**
 * PaymentFormComponent
 *
 * Route: /billing/payment
 *
 * Declarative, signal-driven component. All state is read from billingStore
 * via the single `paymentFlowState()` computed. No constructor logic, no
 * lifecycle hooks, no effects.
 *
 * Flow:
 *   User fills card form → onSubmit() → store.startPaymentFlow(cardInput)
 *       ↓
 *   store handles: resolveCustomer (lazy) → createPaymentMethod → createSubscription
 *       ↓
 *   checkoutPhase: 'processing' → Firestore webhook → 'active' | 'failed'
 *       ↓
 *   paymentFlowState() drives the template @switch
 *
 * Security:
 *  - customerId and publishableKey resolved server-side inside the store.
 *  - Raw card data sent ONLY to api.onvopay.com via publishableKey.
 *  - Premium activation exclusively via webhook → Firestore → onSnapshot.
 */
@Component({
  selector: 'lib-payment-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    PrimaryAnimatedButtonComponent,
    StatusMessageComponent,
  ],
  templateUrl: './payment-form.component.html',
  styleUrl: './payment-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentFormComponent {
  readonly store = inject(billingStore);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly cardForm = this.fb.group({
    holderName: ['', [Validators.required, Validators.minLength(2)]],
    cardNumber: [
      '',
      [
        Validators.required,
        Validators.minLength(13),
        Validators.maxLength(19),
        Validators.pattern(/^\d+$/),
      ],
    ],
    expMonth: [
      null as number | null,
      [Validators.required, Validators.min(1), Validators.max(12)],
    ],
    expYear: [
      null as number | null,
      [
        Validators.required,
        Validators.min(new Date().getFullYear()),
        Validators.max(new Date().getFullYear() + 20),
      ],
    ],
    cvc: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(4),
        Validators.pattern(/^\d+$/),
      ],
    ],
  });

  onSubmit(): void {
    if (this.cardForm.invalid) {
      this.cardForm.markAllAsTouched();
      return;
    }

    const { holderName, cardNumber, expMonth, expYear, cvc } =
      this.cardForm.getRawValue();

    this.store.startPaymentFlow({
      holderName: holderName!.trim(),
      number: cardNumber!.replace(/\s/g, ''),
      expMonth: expMonth!,
      expYear: expYear!,
      cvc: cvc!,
    });
  }

  goHome(): void {
    this.router.navigate(['/dashboard/inicio']);
  }
}
