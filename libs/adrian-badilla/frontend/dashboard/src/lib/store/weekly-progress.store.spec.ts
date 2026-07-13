import { TestBed } from '@angular/core/testing';
import { weeklyProgressStore } from './weekly-progress.store';
import { WeeklyProgressRepository } from '../repositories/weekly-progress.repository';
import { firebaseAuthStore } from '@adrian-badilla/auth';
import type {
  AvailableProgressMonthsPage,
  PreparedProgressImage,
  ProgressPhotoMetadata,
  ProgressPhotoType,
  WeeklyProgressCheckIn,
} from '../types/weekly-progress.types';
import { createDraftCheckIn } from '../utils/weekly-checkin.utils';

jest.mock('../helpers/prepare-progress-image.helper', () => ({
  prepareProgressImage: jest.fn(async () => {
    const blob = new Blob(['ok'], { type: 'image/webp' });
    const prepared: PreparedProgressImage = {
      mainBlob: blob,
      thumbnailBlob: blob,
      contentType: 'image/webp',
      originalSize: 100,
      compressedSize: 80,
      width: 100,
      height: 100,
    };

    return prepared;
  }),
}));

function buildUploadedPhoto(type: ProgressPhotoType): ProgressPhotoMetadata {
  return {
    type,
    storagePath: `users/user-1/progress-checkins/2026-W29/${type}-abc.webp`,
    thumbnailPath: `users/user-1/progress-checkins/2026-W29/thumbnails/${type}-abc.webp`,
    contentType: 'image/webp',
    sizeBytes: 80,
    width: 100,
    height: 100,
    versionToken: `token-${type}`,
    uploadedAt: 'server-timestamp',
  };
}

describe('weeklyProgressStore', () => {
  const authStoreMock = {
    userId: jest.fn(() => 'user-1'),
  };

  const repoMock = {
    getCurrentWeekCheckIn: jest.fn<Promise<WeeklyProgressCheckIn | null>, [string, string]>(),
    getProgressPhotoConsent: jest.fn(async () => null),
    getAvailableMonthsPage: jest.fn<
      Promise<AvailableProgressMonthsPage>,
      [string, { loadedMonthKeys?: string[]; limitMonths?: number }?]
    >(),
    getCheckInsByMonth: jest.fn<Promise<WeeklyProgressCheckIn[]>, [string, string]>(),
    getCheckInByWeek: jest.fn<Promise<WeeklyProgressCheckIn | null>, [string, string]>(),
    saveProgressPhotoConsent: jest.fn(async () => undefined),
    uploadProgressPhoto: jest.fn<Promise<ProgressPhotoMetadata>, [string, string, ProgressPhotoType, PreparedProgressImage]>(),
    saveCheckIn: jest.fn(async () => undefined),
    deleteUploadedPhotoArtifacts: jest.fn(async () => ({
      deletedPaths: [],
      failedPaths: [],
    })),
    deletePhoto: jest.fn(async () => ({
      deletedPaths: [],
      failedPaths: [],
    })),
    deleteCheckIn: jest.fn(async () => ({
      deletedPaths: [],
      failedPaths: [],
    })),
  };

  beforeAll(() => {
    Object.defineProperty(global.URL, 'createObjectURL', {
      value: jest.fn(() => 'blob:preview'),
      configurable: true,
    });
    Object.defineProperty(global.URL, 'revokeObjectURL', {
      value: jest.fn(),
      configurable: true,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    repoMock.getCurrentWeekCheckIn.mockResolvedValue(null);
    repoMock.getAvailableMonthsPage.mockResolvedValue({
      months: [],
      hasMore: false,
    });
    repoMock.getCheckInsByMonth.mockResolvedValue([]);
    repoMock.getCheckInByWeek.mockResolvedValue(null);

    TestBed.configureTestingModule({
      providers: [
        { provide: WeeklyProgressRepository, useValue: repoMock },
        { provide: firebaseAuthStore, useValue: authStoreMock },
      ],
    });
  });

  it('loads initial months progressively', async () => {
    repoMock.getAvailableMonthsPage.mockResolvedValueOnce({
      months: [
        {
          monthKey: '2026-07',
          year: 2026,
          month: 7,
          label: 'julio 2026',
          checkInCount: 2,
          latestWeekId: '2026-W29',
        },
      ],
      hasMore: true,
    });

    const store = TestBed.inject(weeklyProgressStore);
    await store.loadInitialMonths();

    expect(repoMock.getAvailableMonthsPage).toHaveBeenCalledWith('user-1', {
      limitMonths: 3,
    });
    expect(store.availableMonths()).toHaveLength(1);
    expect(store.hasMoreMonths()).toBe(true);
    expect(store.loadedMonthKeys()).toEqual(['2026-07']);
  });

  it('creates a local draft immediately when ensuring the current week draft', () => {
    const store = TestBed.inject(weeklyProgressStore);

    store.ensureCurrentWeekDraft();

    expect(store.currentCheckIn()).not.toBeNull();
    expect(store.currentCheckIn()?.status).toBe('draft');
    expect(store.photoStatuses()).toEqual({
      front: 'idle',
      side: 'idle',
      back: 'idle',
    });
  });

  it('creates a draft when firestore returns null for the current week', async () => {
    const store = TestBed.inject(weeklyProgressStore);

    await store.loadCurrentWeek();

    expect(store.currentCheckIn()).not.toBeNull();
    expect(store.currentCheckIn()?.status).toBe('draft');
    expect(store.photoStatuses()).toEqual({
      front: 'idle',
      side: 'idle',
      back: 'idle',
    });
    expect(store.saveDisabledReason()).toBe(
      'Ingresa un peso valido para completar el check-in.'
    );
  });

  it('does not reload a month that is already cached', async () => {
    const july = createDraftCheckIn({
      uid: 'user-1',
      referenceDate: new Date('2026-07-17T10:00:00Z'),
    });

    repoMock.getCheckInsByMonth.mockResolvedValueOnce([july]);

    const store = TestBed.inject(weeklyProgressStore);
    await store.loadMonthCheckIns('2026-07');
    await store.loadMonthCheckIns('2026-07');

    expect(repoMock.getCheckInsByMonth).toHaveBeenCalledTimes(1);
    expect(store.monthlyCheckIns()['2026-07']).toHaveLength(1);
  });

  it('prevents double save while a save is already running', async () => {
    const draft = createDraftCheckIn({
      uid: 'user-1',
      referenceDate: new Date('2026-07-17T10:00:00Z'),
    });
    draft.measurements.weightKg = 80;
    draft.photos = {
      front: buildUploadedPhoto('front'),
      side: buildUploadedPhoto('side'),
      back: buildUploadedPhoto('back'),
    };

    repoMock.saveCheckIn.mockImplementationOnce(
      () => new Promise<void>(() => undefined)
    );
    repoMock.getCurrentWeekCheckIn.mockResolvedValueOnce(draft);

    const store = TestBed.inject(weeklyProgressStore);
    await store.loadCurrentWeek();
    store.acceptProgressPhotoConsent();

    void store.saveWeeklyCheckIn();
    await Promise.resolve();
    await store.saveWeeklyCheckIn();

    expect(repoMock.saveCheckIn).toHaveBeenCalledTimes(1);
  });

  it('keeps successful uploads and only fails the broken photo', async () => {
    const draft = createDraftCheckIn({
      uid: 'user-1',
      referenceDate: new Date('2026-07-17T10:00:00Z'),
    });
    draft.measurements.weightKg = 80;
    repoMock.getCurrentWeekCheckIn.mockResolvedValueOnce(draft);

    const store = TestBed.inject(weeklyProgressStore);
    await store.loadCurrentWeek();
    store.acceptProgressPhotoConsent();

    await store.selectPhoto(
      'front',
      new File(['front'], 'front.webp', { type: 'image/webp' })
    );
    await store.selectPhoto(
      'side',
      new File(['side'], 'side.webp', { type: 'image/webp' })
    );
    await store.selectPhoto(
      'back',
      new File(['back'], 'back.webp', { type: 'image/webp' })
    );

    repoMock.uploadProgressPhoto.mockImplementation(async (_uid, _weekId, type) => {
      if (type === 'side') {
        throw new Error('side failed');
      }

      return buildUploadedPhoto(type);
    });

    await store.saveWeeklyCheckIn();

    expect(repoMock.saveCheckIn).toHaveBeenCalledTimes(1);
    expect(store.currentCheckIn()?.photos.front?.storagePath).toContain('front-abc');
    expect(store.currentCheckIn()?.photos.back?.storagePath).toContain('back-abc');
    expect(store.currentCheckIn()?.photos.side).toBeUndefined();
    expect(store.photoStatuses().side).toBe('failed');
    expect(store.currentCheckIn()?.status).toBe('failed');
  });

  it('marks the check-in complete only when the three photos exist', async () => {
    const draft = createDraftCheckIn({
      uid: 'user-1',
      referenceDate: new Date('2026-07-17T10:00:00Z'),
    });
    draft.measurements.weightKg = 80;
    draft.photos = {
      front: buildUploadedPhoto('front'),
      side: buildUploadedPhoto('side'),
      back: buildUploadedPhoto('back'),
    };
    repoMock.getCurrentWeekCheckIn.mockResolvedValueOnce(draft);

    const store = TestBed.inject(weeklyProgressStore);
    await store.loadCurrentWeek();
    store.acceptProgressPhotoConsent();

    await store.saveWeeklyCheckIn();

    expect(repoMock.saveCheckIn).toHaveBeenCalledTimes(1);
    expect(repoMock.saveCheckIn.mock.calls[0][1].status).toBe('complete');
  });
});
