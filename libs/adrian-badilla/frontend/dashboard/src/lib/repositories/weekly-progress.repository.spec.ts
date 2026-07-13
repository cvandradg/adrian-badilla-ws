import {
  mapCheckIn,
  sanitizeCheckInForWrite,
} from './weekly-progress.repository';
import { createDraftCheckIn } from '../utils/weekly-checkin.utils';

describe('weekly-progress.repository helpers', () => {
  it('normalizes legacy documents without source', () => {
    const checkIn = mapCheckIn('user-1', '2026-W29', {
      year: 2026,
      month: 7,
      monthKey: '2026-07',
      weekOfMonth: 3,
      userId: 'user-1',
      status: 'complete',
      photos: {
        front: {
          storagePath: 'users/user-1/progress-checkins/2026-W29/front.webp',
          contentType: 'image/webp',
          sizeBytes: 100,
        },
      },
      measurements: {
        weightKg: 80,
      },
      selfAssessment: {},
    });

    expect(checkIn.source).toBe('weekly_checkin');
    expect(checkIn.photos.front?.storagePath).toContain('/front.webp');
  });

  it('strips transient download urls when building firestore payload', () => {
    const checkIn = createDraftCheckIn({
      uid: 'user-1',
      referenceDate: new Date('2026-07-17T10:00:00Z'),
    });

    checkIn.status = 'complete';
    checkIn.measurements.weightKg = 80;
    checkIn.photos.front = {
      type: 'front',
      storagePath: 'users/user-1/progress-checkins/2026-W29/front-a.webp',
      thumbnailPath:
        'users/user-1/progress-checkins/2026-W29/thumbnails/front-a.webp',
      downloadUrl: 'https://example.com/front',
      thumbnailUrl: 'https://example.com/front-thumb',
      contentType: 'image/webp',
      sizeBytes: 123,
      versionToken: 'token-a',
      uploadedAt: 'server-timestamp',
    };

    const payload = sanitizeCheckInForWrite(checkIn);

    expect(payload.source).toBe('weekly_checkin');
    expect(payload.photos['front']).toEqual({
      type: 'front',
      storagePath: 'users/user-1/progress-checkins/2026-W29/front-a.webp',
      thumbnailPath:
        'users/user-1/progress-checkins/2026-W29/thumbnails/front-a.webp',
      contentType: 'image/webp',
      sizeBytes: 123,
      width: undefined,
      height: undefined,
      versionToken: 'token-a',
      uploadedAt: 'server-timestamp',
    });
    expect(payload.photos['front']).not.toHaveProperty('downloadUrl');
    expect(payload.photos['front']).not.toHaveProperty('thumbnailUrl');
  });
});
