import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { billingStore } from '../../store/billing.store';

/**
 * CheckoutReturnPageComponent
 *
 * Route: /billing/return
 * Landing page after the user completes (or cancels) payment on ONVO.
 *
 * Flow:
 *  1. Reads `?status=&session_id=` from query params.
 *  2. If status=success, calls verifyPayment(sessionId).
 *  3. Displays a spinner while pendingVerification is true.
 *  4. The billingStore's onSnapshot listener will fire automatically once
 *     the webhook updates Firestore — no manual activation here.
 *
 * Security: this component NEVER activates premium.
 */
@Component({
  selector: 'lib-checkout-return-page',
  standalone: true,
  imports: [],
  templateUrl: './checkout-return-page.component.html',
  styleUrl: './checkout-return-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutReturnPageComponent implements OnInit {
  readonly store = inject(billingStore);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly queryParams = toSignal(
    this.route.queryParamMap.pipe(
      map((params) => ({
        status: params.get('status'),
        sessionId: params.get('session_id'),
      }))
    )
  );

  readonly isPaymentSuccess = computed(
    () => this.queryParams()?.status === 'success'
  );

  readonly isPaymentCancelled = computed(
    () => this.queryParams()?.status === 'cancel'
  );

  readonly sessionId = computed(() => this.queryParams()?.sessionId ?? null);

  ngOnInit(): void {
    const sid = this.sessionId();
    if (this.isPaymentSuccess() && sid) {
      this.store.verifyPayment(sid);
    }
  }

  goToBilling(): void {
    this.router.navigate(['/billing']);
  }
}
