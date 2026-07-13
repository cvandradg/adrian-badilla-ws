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
  LegacyExerciseSource,
} from '../models/exercise.model';
import {
  BODY_REGION_CATALOG,
  CONTRAINDICATION_SEVERITY_CATALOG,
  EQUIPMENT_CATALOG,
  EXERCISE_CATEGORY_CATALOG,
  EXERCISE_TAG_CATALOG,
  EXERCISE_TYPE_CATALOG,
  GOAL_CATALOG,
  LEVEL_CATALOG,
  MOVEMENT_PATTERN_CATALOG,
  MOVEMENT_PLANE_CATALOG,
  MUSCLE_CATALOG,
  TRAINING_LOCATION_CATALOG,
} from '../shared/catalogs';

const COLLECTION_PATH = 'exercise-library';

type ExerciseDocument = Record<string, unknown> & { id: string };

const levelIds = new Set(LEVEL_CATALOG.map((item) => item.id));
const muscleIds = new Set(MUSCLE_CATALOG.map((item) => item.id));
const equipmentIds = new Set(EQUIPMENT_CATALOG.map((item) => item.id));
const locationIds = new Set(TRAINING_LOCATION_CATALOG.map((item) => item.id));
const bodyRegionIds = new Set(BODY_REGION_CATALOG.map((item) => item.id));
const movementPatternIds = new Set(
  MOVEMENT_PATTERN_CATALOG.map((item) => item.id)
);
const movementPlaneIds = new Set(MOVEMENT_PLANE_CATALOG.map((item) => item.id));
const exerciseCategoryIds = new Set(
  EXERCISE_CATEGORY_CATALOG.map((item) => item.id)
);
const exerciseTypeIds = new Set(EXERCISE_TYPE_CATALOG.map((item) => item.id));
const goalIds = new Set(GOAL_CATALOG.map((item) => item.id));
const tagIds = new Set(EXERCISE_TAG_CATALOG.map((item) => item.id));
const contraindicationSeverityIds = new Set(
  CONTRAINDICATION_SEVERITY_CATALOG.map((item) => item.id)
);

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }

  if (typeof value === 'string' && value.trim()) {
    return [value.trim()];
  }

  return [];
}

function asCatalogId<T extends string>(
  value: unknown,
  validIds: Set<T>
): T | '' {
  return typeof value === 'string' && validIds.has(value as T)
    ? (value as T)
    : '';
}

function asCatalogArray<T extends string>(
  value: unknown,
  validIds: Set<T>
): T[] {
  return asStringArray(value).filter((item): item is T =>
    validIds.has(item as T)
  );
}

function normalizeTags(value: unknown): Exercise['tags'] {
  return asCatalogArray(value, tagIds);
}

function normalizeContraindications(
  value: unknown
): Exercise['contraindications'] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is Record<string, unknown> =>
        !!item && typeof item === 'object'
    )
    .map((item) => ({
      condition: asString(item['condition']),
      severity:
        asCatalogId(item['severity'], contraindicationSeverityIds) || 'caution',
      reason: asString(item['reason']),
    }))
    .filter((item) => item.condition.length > 0);
}

function normalizeExerciseDocument(
  doc: ExerciseDocument
): Exercise & LegacyExerciseSource {
  return {
    id: doc.id,
    name: asString(doc['name']),
    description: asString(doc['description']),
    instructions: asStringArray(doc['instructions']),
    tips: asStringArray(doc['tips']),
    commonMistakes: asStringArray(doc['commonMistakes']),
    primaryMuscles: asCatalogArray(doc['primaryMuscles'], muscleIds),
    secondaryMuscles: asCatalogArray(doc['secondaryMuscles'], muscleIds),
    stabilizerMuscles: asCatalogArray(doc['stabilizerMuscles'], muscleIds),
    bodyRegion: asCatalogId(doc['bodyRegion'], bodyRegionIds),
    movementPattern: asCatalogId(doc['movementPattern'], movementPatternIds),
    movementPlane: asCatalogId(doc['movementPlane'], movementPlaneIds),
    exerciseCategory: asCatalogId(doc['exerciseCategory'], exerciseCategoryIds),
    exerciseType: asCatalogId(doc['exerciseType'], exerciseTypeIds),
    technicalDifficulty:
      asCatalogId(doc['technicalDifficulty'], levelIds) || 'low',
    riskLevel: asCatalogId(doc['riskLevel'], levelIds) || 'low',
    fatigueLevel: asCatalogId(doc['fatigueLevel'], levelIds) || 'low',
    requiredEquipment: asCatalogArray(doc['requiredEquipment'], equipmentIds),
    optionalEquipment: asCatalogArray(doc['optionalEquipment'], equipmentIds),
    trainingLocations: asCatalogArray(doc['trainingLocations'], locationIds),
    contraindications: normalizeContraindications(doc['contraindications']),
    alternativeExerciseIds: asStringArray(doc['alternativeExerciseIds']),
    goals: asCatalogArray(doc['goals'], goalIds),
    tags: normalizeTags(doc['tags']),
    videoUrl: asString(doc['videoUrl']),
    thumbnailUrl: asString(doc['thumbnailUrl']),
    isCompound: Boolean(doc['isCompound']),
    isUnilateral: Boolean(doc['isUnilateral']),
    isBodyweight: Boolean(doc['isBodyweight']),
    isActive: typeof doc['isActive'] === 'boolean' ? doc['isActive'] : true,
    createdAt: doc['createdAt'] as Exercise['createdAt'],
    updatedAt: doc['updatedAt'] as Exercise['updatedAt'],
    difficulty:
      typeof doc['difficulty'] === 'string' ? doc['difficulty'] : undefined,
    alternativeExercises:
      Array.isArray(doc['alternativeExercises']) ||
      typeof doc['alternativeExercises'] === 'string'
        ? (doc[
            'alternativeExercises'
          ] as LegacyExerciseSource['alternativeExercises'])
        : undefined,
  };
}

function normalizeAlternativeExerciseIds(
  exercise: Exercise & LegacyExerciseSource,
  exerciseIds: Set<string>,
  exerciseNameToId: Map<string, string>
): string[] {
  const canonicalIds = exercise.alternativeExerciseIds.filter(
    (id) => id !== exercise.id && exerciseIds.has(id)
  );

  if (canonicalIds.length > 0) {
    return [...new Set(canonicalIds)];
  }

  return asStringArray(exercise.alternativeExercises)
    .map((value) => value.trim())
    .map((value) => {
      if (exerciseIds.has(value)) {
        return value;
      }

      return exerciseNameToId.get(value.toLowerCase()) ?? null;
    })
    .filter((value): value is string => !!value && value !== exercise.id)
    .filter((value, index, list) => list.indexOf(value) === index);
}

function sanitizeExercisePayload(
  data: ExerciseCreatePayload | ExerciseUpdatePayload
): Record<string, unknown> {
  const { ...rest } = data;

  return {
    ...rest,
    alternativeExerciseIds: asStringArray(data.alternativeExerciseIds),
    tags: normalizeTags(data.tags),
  };
}

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
    }).pipe(
      map((documents) => {
        const normalized = (documents as ExerciseDocument[]).map(
          normalizeExerciseDocument
        );
        const exerciseIds = new Set(normalized.map((exercise) => exercise.id));
        const exerciseNameToId = new Map(
          normalized.map((exercise) => [
            exercise.name.toLowerCase(),
            exercise.id,
          ])
        );

        return normalized.map(
          ({
            difficulty: _difficulty,
            alternativeExercises: _legacyAlternatives,
            ...exercise
          }) => ({
            ...exercise,
            alternativeExerciseIds: normalizeAlternativeExerciseIds(
              {
                ...exercise,
                difficulty: _difficulty,
                alternativeExercises: _legacyAlternatives,
              },
              exerciseIds,
              exerciseNameToId
            ),
          })
        );
      })
    );
  }

  /**
   * Creates a new exercise document. Returns the new document ID.
   */
  create(data: ExerciseCreatePayload): Observable<string> {
    const ref = collection(this.#db, COLLECTION_PATH);
    const now = serverTimestamp();
    return from(
      addDoc(ref, {
        ...sanitizeExercisePayload(data),
        createdAt: now,
        updatedAt: now,
      })
    ).pipe(map((docRef) => docRef.id));
  }

  /**
   * Updates an existing exercise document.
   */
  update(id: string, data: ExerciseUpdatePayload): Observable<void> {
    const ref = doc(this.#db, COLLECTION_PATH, id);
    return from(
      updateDoc(ref, {
        ...sanitizeExercisePayload(data),
        updatedAt: serverTimestamp(),
      })
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
