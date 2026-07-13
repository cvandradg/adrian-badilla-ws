import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';
import type {
  RoutineTemplate,
  RoutineCreatePayload,
  RoutineUpdatePayload,
} from '../models/routine.model';

const COLLECTION_PATH = 'routine-library';

function isValidRoutineDocumentId(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    value !== 'true' &&
    value !== 'false'
  );
}

function assertValidRoutineDocumentId(value: unknown): string {
  if (isValidRoutineDocumentId(value)) {
    return value;
  }

  throw new Error(
    `Invalid routine document id "${String(value)}". Expected a real routine id before updating routine-library/{id}.`
  );
}

/**
 * ─── ROUTINE REPOSITORY ───────────────────────────────────────────────────────
 *
 * Pure Firestore infrastructure layer. No state, no Signals, no business logic.
 * Responsible only for reading and writing `routine-library/{routineId}`.
 *
 * Each document stores the full template including embedded `days[]` with
 * `exercises[]` containing only `exerciseId` references — never exercise data.
 */
@Injectable({ providedIn: 'root' })
export class RoutineRepository {
  readonly #db = inject(Firestore);

  getAll(): Observable<RoutineTemplate[]> {
    const ref = collection(this.#db, COLLECTION_PATH);
    return collectionData(query(ref, orderBy('name')), {
      idField: 'id',
    }) as Observable<RoutineTemplate[]>;
  }

  create(data: RoutineCreatePayload): Observable<string> {
    const ref = collection(this.#db, COLLECTION_PATH);
    const now = serverTimestamp();
    return from(addDoc(ref, { ...data, createdAt: now, updatedAt: now })).pipe(
      map((docRef) => docRef.id)
    );
  }

  update(id: string, data: RoutineUpdatePayload): Observable<void> {
    const ref = doc(this.#db, COLLECTION_PATH, assertValidRoutineDocumentId(id));
    return from(
      updateDoc(ref, { ...data, updatedAt: serverTimestamp() })
    ) as Observable<void>;
  }

  delete(id: string): Observable<void> {
    const ref = doc(this.#db, COLLECTION_PATH, assertValidRoutineDocumentId(id));
    return from(deleteDoc(ref)) as Observable<void>;
  }
}
