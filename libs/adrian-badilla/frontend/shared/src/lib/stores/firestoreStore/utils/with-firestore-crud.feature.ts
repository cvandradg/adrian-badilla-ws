import {
  inject,
  EnvironmentInjector,
  runInInjectionContext,
} from '@angular/core';
import {
  doc,
  addDoc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  Firestore,
  collection,
  type CollectionReference,
  type DocumentData,
  type DocumentReference,
  type UpdateData,
} from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { from, Observable } from 'rxjs';
import { signalStoreFeature, withMethods, withProps } from '@ngrx/signals';

function toPathArgs(path: string): [string, ...string[]] {
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) throw new Error(`Invalid Firestore path: "${path}"`);
  return parts as [string, ...string[]];
}

function collectionRef<T extends DocumentData>(
  firestore: Firestore,
  path: string,
): CollectionReference<T, T> {
  return collection(
    firestore,
    ...toPathArgs(path),
  ) as unknown as CollectionReference<T, T>;
}

function documentRef<T extends DocumentData>(
  firestore: Firestore,
  path: string,
): DocumentReference<T, T> {
  return doc(firestore, ...toPathArgs(path)) as unknown as DocumentReference<
    T,
    T
  >;
}

export function withFirestoreCrud() {
  return signalStoreFeature(
    withProps(() => ({
      _fs: inject(Firestore),
      _injector: inject(EnvironmentInjector),
    })),

    withMethods((store) => ({
      _create: <T extends DocumentData>(params: {
        collectionPath: string;
        data: T;
      }): Observable<DocumentReference<T>> => {
        return runInInjectionContext(store._injector, () => {
          const col = collectionRef<T>(store._fs, params.collectionPath);

          return from(addDoc(col, params.data)) as Observable<
            DocumentReference<T>
          >;
        });
      },

      _set: <T extends DocumentData>(params: {
        collectionPath: string;
        id: string;
        data: T;
        merge?: boolean;
      }): Observable<void> => {
        return runInInjectionContext(store._injector, () => {
          const ref = documentRef<T>(
            store._fs,
            `${params.collectionPath}/${params.id}`,
          );

          return from(
            setDoc(ref, params.data, { merge: params.merge ?? false }),
          ) as Observable<void>;
        });
      },

      _update: <T extends DocumentData>(params: {
        collectionPath: string;
        id: string;
        data: Partial<T>;
      }): Observable<void> => {
        return runInInjectionContext(store._injector, () => {
          const ref = documentRef<T>(
            store._fs,
            `${params.collectionPath}/${params.id}`,
          );

          return from(
            updateDoc(ref, params.data as UpdateData<T>),
          ) as Observable<void>;
        });
      },

      _remove: (params: {
        collectionPath: string;
        id: string;
      }): Observable<void> => {
        return runInInjectionContext(store._injector, () => {
          const ref = documentRef<DocumentData>(
            store._fs,
            `${params.collectionPath}/${params.id}`,
          );

          return from(deleteDoc(ref));
        });
      },

      _get: <T extends DocumentData>(params: {
        collectionPath: string;
        id: string;
      }): Observable<(T & { id: string }) | undefined> => {
        return runInInjectionContext(store._injector, () => {
          const ref = documentRef<T>(
            store._fs,
            `${params.collectionPath}/${params.id}`,
          );

          return from(getDoc(ref)).pipe(
            map((snap) =>
              snap.exists()
                ? { id: snap.id, ...(snap.data() as T) }
                : undefined,
            ),
          );
        });
      },
    })),
  );
}
