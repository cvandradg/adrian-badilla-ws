import type { Timestamp } from 'firebase/firestore';

/**
 * Shape of a document stored at `users/{uid}/payments/{paymentId}`.
 * Written exclusively by Firebase Functions via admin SDK.
 * The Angular client only reads this subcollection.
 */
export interface PaymentRecord {
  id: string;
  provider: 'onvo';
  amount: number;
  currency: string;
  status: string;
  transactionId: string;
  createdAt: Timestamp;
}
