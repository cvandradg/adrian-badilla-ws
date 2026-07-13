import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  query,
  orderBy,
} from '@angular/fire/firestore';
import type { Observable } from 'rxjs';

export interface ExerciseRef {
  id: string;
  name: string;
  thumbnailUrl: string;
  primaryMuscles: string[];
  requiredEquipment: string[];
  difficulty: string;
}

/**
 * Lightweight read-only repository used by the routine editor
 * to browse the exercise-library collection.
 * Keeps routine-builder independent from the exercise-library lazy chunk.
 */
@Injectable({ providedIn: 'root' })
export class ExercisePickerRepository {
  readonly #db = inject(Firestore);

  getAll(): Observable<ExerciseRef[]> {
    const ref = collection(this.#db, 'exercise-library');
    return collectionData(query(ref, orderBy('name')), {
      idField: 'id',
    }) as Observable<ExerciseRef[]>;
  }
}
