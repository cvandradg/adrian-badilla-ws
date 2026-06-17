import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnInit,
  untracked,
} from '@angular/core';
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
 * Implements the ONVO Loop card-capture flow using the existing billing store:
 *
 *   ngOnInit → prepareCheckout()               [resolves customerId + publishableKey]
 *       ↓
 *   User fills card form → onSubmit()
 *       ↓
 *   createPaymentMethod(cardInput)             [POST /v1/payment-methods via ONVO API]
 *       ↓
 *   paymentMethodId arrives in store → effect
 *       ↓
 *   subscribeCheckout()                        [Firebase callable createSubscription]
 *       ↓
 *   Webhook → Firestore → onSnapshot → store.isPremium() = true
 *
 * Security:
 *  - customerId and publishableKey are read from store state, never from inputs.
 *  - Raw card data never reaches any backend — it goes directly to api.onvopay.com.
 *  - Premium activation occurs exclusively via webhook → Firestore → onSnapshot.
 *
 * Dependencies: billingStore, Angular Material, @angular/forms — no new services.
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
export class PaymentFormComponent implements OnInit {
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

  constructor() {
    // When createPaymentMethod() resolves a paymentMethodId, automatically
    // proceed to subscribeCheckout(). Uses untracked() so the effect only
    // re-executes when paymentMethodId changes, not on every render.
    //
    // Guards against stale store state on component re-creation:
    //  - subscribeLoading: a prior subscribeCheckout() is still in flight
    //  - subscribeSuccess: subscribeCheckout() already completed successfully
    // Without these guards, navigating back to this page after a successful
    // payment would immediately re-trigger subscribeCheckout() with stale state.
    effect(() => {
      const pmId = this.store.paymentMethodId();
      if (
        pmId &&
        untracked(
          () =>
            this.store.cardSuccess() &&
            !this.store.subscribeLoading() &&
            !this.store.subscribeSuccess()
        )
      ) {
        this.store.subscribeCheckout();
      }
    });
  }

  ngOnInit(): void {
    // Reset stale card/subscribe state from any previous payment attempt so
    // this component always starts with a clean slate.
    // customerId and publishableKey are also cleared inside prepareCheckout()'s
    // tap(), but paymentMethodId, cardSuccess, and subscribeSuccess persist in
    // the singleton store across navigations and must be explicitly reset here.
    this.store.cardResetState();
    this.store.subscribeResetState();
    this.store.prepareResetState();
    // Resolve (or create) the ONVO customer and retrieve the publishableKey.
    // This must complete before createPaymentMethod() can run.
    this.store.prepareCheckout();
  }

  onSubmit(): void {
    if (this.cardForm.invalid || !this.store.hasCustomerId()) {
      this.cardForm.markAllAsTouched();
      return;
    }

    const { holderName, cardNumber, expMonth, expYear, cvc } =
      this.cardForm.getRawValue();

    this.store.createPaymentMethod({
      holderName: holderName!.trim(),
      number: cardNumber!.replace(/\s/g, ''),
      expMonth: expMonth!,
      expYear: expYear!,
      cvc: cvc!,
    });
  }

  // ─── Template helpers ───────────────────────────────────────────────────────

  /** True while any async operation initiated by this component is in flight. */
  get isProcessing(): boolean {
    return (
      this.store.prepareLoading() ||
      this.store.cardLoading() ||
      this.store.subscribeLoading()
    );
  }

  /** True when the full subscription flow completed successfully. */
  get isComplete(): boolean {
    return this.store.subscribeSuccess();
  }

  goHome(): void {
    this.router.navigate(['/dashboard/inicio']);
  }

  /** The most recent user-facing error across all three steps. */
  get currentError(): string | null {
    return (
      this.store.prepareError() ||
      this.store.cardError() ||
      this.store.subscribeError()
    );
  }
}
