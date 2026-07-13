import { inject, Injectable, isDevMode } from '@angular/core';
import {
  Firestore,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import {
  Storage,
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from '@angular/fire/storage';
import { WEEKLY_CHECKIN_CONFIG } from '../constants/weekly-checkin.constants';
import type {
  AvailableProgressMonth,
  AvailableProgressMonthsPage,
  PreparedProgressImage,
  ProgressPhotoConsent,
  ProgressPhotoDeletionResult,
  ProgressPhotoMetadata,
  ProgressPhotoType,
  StoredProgressPhotoPayload,
  WeeklyProgressCheckIn,
} from '../types/weekly-progress.types';
import { formatMonthLabel } from '../utils/weekly-checkin.utils';

function checkInsCollection(db: Firestore, uid: string) {
  return collection(db, 'users', uid, 'progress-checkins');
}

function checkInDoc(db: Firestore, uid: string, weekId: string) {
  return doc(db, 'users', uid, 'progress-checkins', weekId);
}

function consentDoc(db: Firestore, uid: string) {
  return doc(db, 'users', uid, 'privacy-consents', 'progress-photos');
}

function devLog(message: string, payload?: unknown): void {
  if (!isDevMode()) {
    return;
  }

  console.info(`[weekly-progress] ${message}`, payload);
}

function normalizeWeekId(weekId: string): string {
  return String(weekId ?? '').trim();
}

function normalizePhotoMetadata(
  type: ProgressPhotoType,
  metadata: unknown
): ProgressPhotoMetadata | undefined {
  if (!metadata || typeof metadata !== 'object') {
    return undefined;
  }

  const value = metadata as Record<string, unknown>;
  const storagePath = String(value['storagePath'] ?? '').trim();

  if (!storagePath) {
    return undefined;
  }

  return {
    type,
    storagePath,
    thumbnailPath:
      typeof value['thumbnailPath'] === 'string'
        ? value['thumbnailPath']
        : undefined,
    downloadUrl:
      typeof value['downloadUrl'] === 'string' ? value['downloadUrl'] : undefined,
    thumbnailUrl:
      typeof value['thumbnailUrl'] === 'string'
        ? value['thumbnailUrl']
        : undefined,
    contentType: String(value['contentType'] ?? 'image/webp'),
    sizeBytes: Number(value['sizeBytes'] ?? 0),
    width: typeof value['width'] === 'number' ? value['width'] : undefined,
    height: typeof value['height'] === 'number' ? value['height'] : undefined,
    versionToken:
      typeof value['versionToken'] === 'string'
        ? value['versionToken']
        : undefined,
    uploadedAt: value['uploadedAt'] ?? null,
  };
}

export function mapCheckIn(
  uid: string,
  weekId: string,
  data: Record<string, unknown>
): WeeklyProgressCheckIn {
  const normalizedWeekId = normalizeWeekId(weekId);
  const rawPhotos =
    data['photos'] && typeof data['photos'] === 'object'
      ? (data['photos'] as Record<string, unknown>)
      : {};
  const photos = {
    front: normalizePhotoMetadata('front', rawPhotos['front']),
    side: normalizePhotoMetadata('side', rawPhotos['side']),
    back: normalizePhotoMetadata('back', rawPhotos['back']),
  };

  return {
    id: normalizedWeekId,
    weekId: normalizedWeekId,
    year: Number(data['year'] ?? 0),
    month: Number(data['month'] ?? 0),
    monthKey: String(data['monthKey'] ?? ''),
    weekOfMonth: Number(data['weekOfMonth'] ?? 1),
    userId: String(data['userId'] ?? uid),
    checkInDate: data['checkInDate'] ?? null,
    status: (data['status'] as WeeklyProgressCheckIn['status']) ?? 'draft',
    measurements:
      (data['measurements'] as WeeklyProgressCheckIn['measurements']) ?? {
        weightKg: null,
        bodyFatPercent: null,
        chestCm: null,
        waistCm: null,
        hipCm: null,
        leftArmCm: null,
        rightArmCm: null,
        thighCm: null,
        calfCm: null,
      },
    photos,
    selfAssessment:
      (data['selfAssessment'] as WeeklyProgressCheckIn['selfAssessment']) ?? {
        energy: null,
        hunger: null,
        soreness: null,
        stress: null,
        motivation: null,
        sleepAverageHours: null,
        dietAdherencePercent: null,
        workoutsCompleted: null,
        workoutsPlanned: null,
      },
    notes: String(data['notes'] ?? ''),
    consentVersion:
      typeof data['consentVersion'] === 'string'
        ? String(data['consentVersion'])
        : undefined,
    source:
      data['source'] === 'legacy_monthly' || data['source'] === 'demo'
        ? data['source']
        : 'weekly_checkin',
    createdAt: data['createdAt'] ?? null,
    updatedAt: data['updatedAt'] ?? null,
  };
}

async function enrichPhotoUrls(
  storage: Storage,
  metadata: ProgressPhotoMetadata | undefined
): Promise<ProgressPhotoMetadata | undefined> {
  if (!metadata) {
    return undefined;
  }

  const [downloadUrl, thumbnailUrl] = await Promise.all([
    metadata.downloadUrl
      ? Promise.resolve(metadata.downloadUrl)
      : getDownloadURL(ref(storage, metadata.storagePath)).catch(() => undefined),
    metadata.thumbnailPath
      ? getDownloadURL(ref(storage, metadata.thumbnailPath)).catch(
          () => metadata.thumbnailUrl
        )
      : Promise.resolve(metadata.thumbnailUrl),
  ]);

  return {
    ...metadata,
    downloadUrl,
    thumbnailUrl,
  };
}

function toStoragePhotoPayload(
  photo: ProgressPhotoMetadata
): StoredProgressPhotoPayload {
  return {
    type: photo.type,
    storagePath: photo.storagePath,
    thumbnailPath: photo.thumbnailPath,
    contentType: photo.contentType,
    sizeBytes: photo.sizeBytes,
    width: photo.width,
    height: photo.height,
    versionToken: photo.versionToken ?? 'legacy',
  };
}

export function sanitizeCheckInForWrite(checkIn: WeeklyProgressCheckIn) {
  return {
    id: checkIn.id,
    weekId: checkIn.weekId,
    year: checkIn.year,
    month: checkIn.month,
    monthKey: checkIn.monthKey,
    weekOfMonth: checkIn.weekOfMonth,
    userId: checkIn.userId,
    checkInDate: checkIn.checkInDate,
    status: checkIn.status,
    measurements: { ...checkIn.measurements },
    photos: Object.fromEntries(
      Object.entries(checkIn.photos)
        .filter(([, photo]) => photo?.storagePath)
        .map(([type, photo]) => [
          type,
          {
            ...toStoragePhotoPayload(photo!),
            uploadedAt: photo!.uploadedAt,
          },
        ])
    ),
    selfAssessment: { ...checkIn.selfAssessment },
    notes: checkIn.notes,
    consentVersion: checkIn.consentVersion,
    source: checkIn.source ?? 'weekly_checkin',
  };
}

async function deleteStoragePaths(
  storage: Storage,
  paths: Array<string | undefined>
): Promise<ProgressPhotoDeletionResult> {
  const deletedPaths: string[] = [];
  const failedPaths: string[] = [];

  for (const path of paths) {
    if (!path) {
      continue;
    }

    try {
      await deleteObject(ref(storage, path));
      deletedPaths.push(path);
    } catch {
      failedPaths.push(path);
    }
  }

  return {
    deletedPaths,
    failedPaths,
  };
}

function buildVersionedPhotoPaths(input: {
  uid: string;
  weekId: string;
  type: ProgressPhotoType;
}) {
  const versionToken = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  const basePath = `users/${input.uid}/progress-checkins/${input.weekId}`;

  return {
    mainPath: `${basePath}/${input.type}-${versionToken}.webp`,
    thumbnailPath: `${basePath}/thumbnails/${input.type}-${versionToken}.webp`,
    versionToken,
  };
}

@Injectable({ providedIn: 'root' })
export class WeeklyProgressRepository {
  readonly #db = inject(Firestore);
  readonly #storage = inject(Storage);

  async getCurrentWeekCheckIn(
    uid: string,
    weekId: string
  ): Promise<WeeklyProgressCheckIn | null> {
    return this.getCheckInByWeek(uid, weekId);
  }

  async getAvailableMonthsPage(
    uid: string,
    options: {
      loadedMonthKeys?: string[];
      limitMonths?: number;
    } = {}
  ): Promise<AvailableProgressMonthsPage> {
    const loadedMonthKeys = new Set(options.loadedMonthKeys ?? []);
    const limitMonths = Math.max(options.limitMonths ?? 3, 1);
    let hasMore = false;
    let cursor: unknown = undefined;
    const monthMap = new Map<string, AvailableProgressMonth>();

    while (monthMap.size < limitMonths) {
      const monthQuery = query(
        checkInsCollection(this.#db, uid),
        orderBy('checkInDate', 'desc'),
        ...(cursor ? [startAfter(cursor)] : []),
        limit(limitMonths * 8)
      );
      const snapshot = await getDocs(monthQuery);

      if (snapshot.empty) {
        break;
      }

      cursor = snapshot.docs.at(-1);

      for (const item of snapshot.docs) {
        const data = item.data() as Record<string, unknown>;
        const monthKey = String(data['monthKey'] ?? '');
        const year = Number(data['year'] ?? 0);
        const month = Number(data['month'] ?? 0);

        if (!monthKey || !year || !month || loadedMonthKeys.has(monthKey)) {
          continue;
        }

        const current = monthMap.get(monthKey);
        monthMap.set(monthKey, {
          monthKey,
          year,
          month,
          label: formatMonthLabel(year, month),
          checkInCount: (current?.checkInCount ?? 0) + 1,
          latestWeekId: current?.latestWeekId ?? item.id,
        });
      }

      if (snapshot.docs.length < limitMonths * 8) {
        break;
      }
    }

    if (cursor) {
      const validationQuery = query(
        checkInsCollection(this.#db, uid),
        orderBy('checkInDate', 'desc'),
        startAfter(cursor),
        limit(1)
      );
      const validationSnapshot = await getDocs(validationQuery);
      hasMore = !validationSnapshot.empty;
    }

    const months = [...monthMap.values()]
      .sort((left, right) => right.monthKey.localeCompare(left.monthKey))
      .slice(0, limitMonths);

    devLog('available months page', {
      uid,
      loadedMonthKeys: [...loadedMonthKeys],
      monthKeys: months.map((month) => month.monthKey),
      hasMore,
    });

    return {
      months,
      hasMore,
    };
  }

  async getAvailableMonths(uid: string): Promise<AvailableProgressMonth[]> {
    const page = await this.getAvailableMonthsPage(uid, {
      limitMonths: WEEKLY_CHECKIN_CONFIG.recentMonthsLimit,
    });
    return page.months;
  }

  async getCheckInsByMonth(
    uid: string,
    monthKey: string
  ): Promise<WeeklyProgressCheckIn[]> {
    const monthQuery = query(
      checkInsCollection(this.#db, uid),
      where('monthKey', '==', monthKey),
      orderBy('checkInDate', 'desc')
    );
    const snapshot = await getDocs(monthQuery);

    devLog('load month check-ins', {
      uid,
      monthKey,
      total: snapshot.docs.length,
    });

    return snapshot.docs.map((item) =>
      mapCheckIn(uid, item.id, item.data() as Record<string, unknown>)
    );
  }

  async getCheckInByWeek(
    uid: string,
    weekId: string
  ): Promise<WeeklyProgressCheckIn | null> {
    const snapshot = await getDoc(checkInDoc(this.#db, uid, weekId));

    if (!snapshot.exists()) {
      return null;
    }

    const checkIn = mapCheckIn(
      uid,
      snapshot.id,
      snapshot.data() as Record<string, unknown>
    );
    const enrichedPhotos = await Promise.all(
      (Object.entries(checkIn.photos) as Array<
        [ProgressPhotoType, ProgressPhotoMetadata | undefined]
      >).map(async ([type, metadata]) => [
        type,
        await enrichPhotoUrls(this.#storage, metadata),
      ])
    );

    return {
      ...checkIn,
      photos: Object.fromEntries(
        enrichedPhotos.filter(([, metadata]) => metadata != null)
      ) as WeeklyProgressCheckIn['photos'],
    };
  }

  async getProgressPhotoConsent(uid: string): Promise<ProgressPhotoConsent | null> {
    const snapshot = await getDoc(consentDoc(this.#db, uid));

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data() as ProgressPhotoConsent;
  }

  async saveProgressPhotoConsent(uid: string, version: string): Promise<void> {
    await setDoc(
      consentDoc(this.#db, uid),
      {
        consented: true,
        version,
        purpose: 'weekly_progress_tracking',
        acceptedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  async uploadProgressPhoto(
    uid: string,
    weekId: string,
    type: ProgressPhotoType,
    preparedImage: PreparedProgressImage
  ): Promise<ProgressPhotoMetadata> {
    const paths = buildVersionedPhotoPaths({
      uid,
      weekId,
      type,
    });

    devLog('upload photo start', {
      uid,
      weekId,
      type,
      storagePath: paths.mainPath,
      thumbnailPath: paths.thumbnailPath,
    });

    await uploadBytes(ref(this.#storage, paths.mainPath), preparedImage.mainBlob, {
      contentType: preparedImage.contentType,
    });
    await uploadBytes(
      ref(this.#storage, paths.thumbnailPath),
      preparedImage.thumbnailBlob,
      {
        contentType: preparedImage.contentType,
      }
    );

    const [downloadUrl, thumbnailUrl] = await Promise.all([
      getDownloadURL(ref(this.#storage, paths.mainPath)),
      getDownloadURL(ref(this.#storage, paths.thumbnailPath)),
    ]);

    return {
      type,
      storagePath: paths.mainPath,
      thumbnailPath: paths.thumbnailPath,
      downloadUrl,
      thumbnailUrl,
      contentType: preparedImage.contentType,
      sizeBytes: preparedImage.compressedSize,
      width: preparedImage.width,
      height: preparedImage.height,
      versionToken: paths.versionToken,
      uploadedAt: serverTimestamp(),
    };
  }

  async deleteUploadedPhotoArtifacts(
    photo: ProgressPhotoMetadata | undefined
  ): Promise<ProgressPhotoDeletionResult> {
    return deleteStoragePaths(this.#storage, [
      photo?.storagePath,
      photo?.thumbnailPath,
    ]);
  }

  async saveCheckIn(uid: string, checkIn: WeeklyProgressCheckIn): Promise<void> {
    const payload = sanitizeCheckInForWrite(checkIn);
    devLog('save check-in', {
      uid,
      weekId: checkIn.weekId,
      status: checkIn.status,
      source: checkIn.source,
      photoTypes: Object.keys(payload.photos),
    });

    await setDoc(
      checkInDoc(this.#db, uid, checkIn.weekId),
      {
        ...payload,
        userId: uid,
        source: payload.source ?? 'weekly_checkin',
        checkInDate: checkIn.checkInDate ?? serverTimestamp(),
        createdAt: checkIn.createdAt ?? serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  async deletePhoto(
    uid: string,
    weekId: string,
    type: ProgressPhotoType
  ): Promise<ProgressPhotoDeletionResult> {
    const snapshot = await getDoc(checkInDoc(this.#db, uid, weekId));
    const checkIn = snapshot.exists()
      ? mapCheckIn(uid, snapshot.id, snapshot.data() as Record<string, unknown>)
      : null;
    const photo = checkIn?.photos[type];
    const deletionResult = await deleteStoragePaths(this.#storage, [
      photo?.storagePath,
      photo?.thumbnailPath,
    ]);

    await updateDoc(checkInDoc(this.#db, uid, weekId), {
      userId: uid,
      weekId,
      source: checkIn?.source ?? 'weekly_checkin',
      [`photos.${type}`]: deleteField(),
      status: 'draft',
      updatedAt: serverTimestamp(),
    });

    devLog('delete photo', {
      uid,
      weekId,
      type,
      deletedPaths: deletionResult.deletedPaths,
      failedPaths: deletionResult.failedPaths,
    });

    return deletionResult;
  }

  async deleteCheckIn(
    uid: string,
    weekId: string
  ): Promise<ProgressPhotoDeletionResult> {
    const checkIn = await this.getCheckInByWeek(uid, weekId);
    const deletionResult = await deleteStoragePaths(
      this.#storage,
      Object.values(checkIn?.photos ?? {}).flatMap((photo) =>
        photo ? [photo.storagePath, photo.thumbnailPath] : []
      )
    );

    await deleteDoc(checkInDoc(this.#db, uid, weekId));

    devLog('delete check-in', {
      uid,
      weekId,
      deletedPaths: deletionResult.deletedPaths,
      failedPaths: deletionResult.failedPaths,
    });

    return deletionResult;
  }
}
