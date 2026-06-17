import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import type { Subscription } from '../models/subscription.model';
import type { PaymentRecord } from '../models/payment.model';

// ─── Internal path helpers ────────────────────────────────────────────────────
// Self-contained so the lib has zero deps on project-specific utils.

const paths = {
  userDoc: (uid: string) => `users/${uid}`,
  payments: (uid: string) => `users/${uid}/payments`,
} as const;

// ─── Repository ───────────────────────────────────────────────────────────────

/**
 * SubscriptionRepository
 *
 * Pure Firestore infrastructure. No state, no business logic.
 * Reads the `subscription` field embedded in `users/{uid}` via `onSnapshot`
 * for real-time updates, and reads the `payments` subcollection on demand.
 *
 * The `subscription` field is written exclusively by Firebase Functions
 * (admin SDK). This repository never writes to Firestore.
 */
@Injectable({ providedIn: 'root' })
export class SubscriptionRepository {
  readonly #db = inject(Firestore);

  /**
   * Returns a real-time Observable that emits the `subscription` field
   * from `users/{uid}` every time it changes in Firestore.
   *
   * Emits `null` if the document exists but has no `subscription` field.
   * The Observable completes when the caller unsubscribes.
   */
  watchSubscription$(uid: string): Observable<Subscription | null> {
    return new Observable<Subscription | null>((subscriber) => {
      const ref = doc(this.#db, ...splitPath(paths.userDoc(uid)));

      const unsubscribe = onSnapshot(
        ref,
        (snap) => {
          if (!snap.exists()) {
            subscriber.next(null);
            return;
          }
          const data = snap.data();
          subscriber.next(
            (data['subscription'] as Subscription | undefined) ?? null
          );
        },
        (err) => subscriber.error(err)
      );

      return () => unsubscribe();
    });
  }

  /**
   * One-shot read of the `subscription` field from `users/{uid}`.
   * Use this for refresh operations where a persistent listener is not needed.
   * Does not open an onSnapshot — single Firestore read, then completes.
   */
  getSubscriptionOnce(uid: string): Observable<Subscription | null> {
    return new Observable<Subscription | null>((subscriber) => {
      const ref = doc(this.#db, ...splitPath(paths.userDoc(uid)));
      getDoc(ref)
        .then((snap) => {
          subscriber.next(
            snap.exists()
              ? (snap.data()['subscription'] as Subscription | undefined) ??
                  null
              : null
          );
          subscriber.complete();
        })
        .catch((err) => subscriber.error(err));
    });
  }

  /**
   * Fetches the last `pageSize` payment records for the user,
   * ordered by `createdAt` descending (most recent first).
   */
  getPaymentHistory(uid: string, pageSize = 20): Observable<PaymentRecord[]> {
    return new Observable<PaymentRecord[]>((subscriber) => {
      const col = collection(this.#db, ...splitPath(paths.payments(uid)));
      const q = query(col, orderBy('createdAt', 'desc'), limit(pageSize));

      getDocs(q)
        .then((snap) => {
          const records: PaymentRecord[] = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<PaymentRecord, 'id'>),
          }));
          subscriber.next(records);
          subscriber.complete();
        })
        .catch((err) => subscriber.error(err));
    });
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Splits a slash-delimited path into the tuple form Angular Fire expects. */
function splitPath(path: string): [string, ...string[]] {
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) throw new Error(`[billing] Invalid path: "${path}"`);
  return parts as [string, ...string[]];
}
