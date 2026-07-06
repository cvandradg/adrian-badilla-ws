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
  Exercise,
  ExerciseCreatePayload,
  ExerciseUpdatePayload,
} from '../models/exercise.model';

const COLLECTION_PATH = 'exercise-library';

/**
 * ─── EXERCISE REPOSITORY ──────────────────────────────────────────────────────
 *
 * Pure Firestore infrastructure layer. No state, no Signals, no business logic.
 * Responsible only for reading and writing `exercise-library/{exerciseId}`.
 *
 * Collection: `exercise-library`
 * Document path: `exercise-library/{exerciseId}`
 */
@Injectable({ providedIn: 'root' })
export class ExerciseRepository {
  readonly #db = inject(Firestore);

  /**
   * Returns a live Firestore stream of all exercises ordered by name.
   */
  getAll(): Observable<Exercise[]> {
    const ref = collection(this.#db, COLLECTION_PATH);
    return collectionData(query(ref, orderBy('name')), {
      idField: 'id',
    }) as Observable<Exercise[]>;
  }

  /**
   * Creates a new exercise document. Returns the new document ID.
   */
  create(data: ExerciseCreatePayload): Observable<string> {
    const ref = collection(this.#db, COLLECTION_PATH);
    const now = serverTimestamp();
    return from(addDoc(ref, { ...data, createdAt: now, updatedAt: now })).pipe(
      map((docRef) => docRef.id)
    );
  }

  /**
   * Updates an existing exercise document.
   */
  update(id: string, data: ExerciseUpdatePayload): Observable<void> {
    const ref = doc(this.#db, COLLECTION_PATH, id);
    return from(
      updateDoc(ref, { ...data, updatedAt: serverTimestamp() })
    ) as Observable<void>;
  }

  /**
   * Deletes an exercise document by ID.
   */
  delete(id: string): Observable<void> {
    const ref = doc(this.#db, COLLECTION_PATH, id);
    return from(deleteDoc(ref)) as Observable<void>;
  }
}
