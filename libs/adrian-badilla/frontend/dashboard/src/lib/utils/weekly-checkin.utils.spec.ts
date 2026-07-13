import {
  createDraftCheckIn,
  getCurrentIsoWeekId,
  getMonthKey,
  getNextFriday,
  getWeekOfMonth,
  groupCheckInsByYearMonth,
  hasRequiredProgressPhotos,
  isCheckInWindowOpen,
  listMeasurementTrends,
  validateProgressImageFile,
} from './weekly-checkin.utils';

describe('weekly-checkin.utils', () => {
  it('builds the correct ISO week id', () => {
    expect(getCurrentIsoWeekId(new Date('2026-07-17T10:00:00Z'))).toBe(
      '2026-W29'
    );
  });

  it('computes the correct week of month', () => {
    expect(getWeekOfMonth(new Date('2026-07-17T10:00:00Z'))).toBe(3);
  });

  it('computes the month key', () => {
    expect(getMonthKey(new Date('2026-07-17T10:00:00Z'))).toBe('2026-07');
  });

  it('computes next friday correctly from wednesday', () => {
    const nextFriday = getNextFriday(new Date('2026-07-15T10:00:00Z'));

    expect(nextFriday.getDay()).toBe(5);
    expect(nextFriday.getDate()).toBe(17);
    expect(nextFriday.getMonth()).toBe(6);
    expect(nextFriday.getFullYear()).toBe(2026);
  });

  it('opens the check-in window on friday saturday and sunday only', () => {
    expect(isCheckInWindowOpen(new Date('2026-07-17T10:00:00Z'))).toBe(true);
    expect(isCheckInWindowOpen(new Date('2026-07-18T10:00:00Z'))).toBe(true);
    expect(isCheckInWindowOpen(new Date('2026-07-19T10:00:00Z'))).toBe(true);
    expect(isCheckInWindowOpen(new Date('2026-07-20T10:00:00Z'))).toBe(false);
  });

  it('validates file mime and size', () => {
    const validFile = new File(['ok'], 'photo.webp', { type: 'image/webp' });
    const invalidType = new File(['ok'], 'photo.gif', { type: 'image/gif' });
    const invalidSize = new File(['ok'], 'photo.jpg', { type: 'image/jpeg' });
    Object.defineProperty(invalidSize, 'size', { value: 11 * 1024 * 1024 });

    expect(validateProgressImageFile(validFile)).toEqual({
      valid: true,
      error: null,
    });
    expect(validateProgressImageFile(invalidType).valid).toBe(false);
    expect(validateProgressImageFile(invalidSize).valid).toBe(false);
  });

  it('requires the three progress photos', () => {
    expect(
      hasRequiredProgressPhotos({
        front: { ok: true },
        side: { ok: true },
      })
    ).toBe(false);

    expect(
      hasRequiredProgressPhotos({
        front: { ok: true },
        side: { ok: true },
        back: { ok: true },
      })
    ).toBe(true);
  });

  it('groups check-ins by year then month then week', () => {
    const july = createDraftCheckIn({
      uid: 'user-1',
      referenceDate: new Date('2026-07-17T10:00:00Z'),
    });
    const june = createDraftCheckIn({
      uid: 'user-1',
      referenceDate: new Date('2026-06-12T10:00:00Z'),
    });
    const grouped = groupCheckInsByYearMonth([june, july], [
      {
        monthKey: july.monthKey,
        year: july.year,
        month: july.month,
        label: 'julio 2026',
        checkInCount: 1,
        latestWeekId: july.weekId,
      },
      {
        monthKey: june.monthKey,
        year: june.year,
        month: june.month,
        label: 'junio 2026',
        checkInCount: 1,
        latestWeekId: june.weekId,
      },
    ]);

    expect(grouped).toHaveLength(1);
    expect(grouped[0].months[0].monthKey).toBe('2026-07');
    expect(grouped[0].months[1].monthKey).toBe('2026-06');
  });

  it('compares trends against the previous week', () => {
    const current = createDraftCheckIn({
      uid: 'user-1',
      referenceDate: new Date('2026-07-17T10:00:00Z'),
    });
    const previous = createDraftCheckIn({
      uid: 'user-1',
      referenceDate: new Date('2026-07-10T10:00:00Z'),
    });

    current.measurements.weightKg = 80;
    previous.measurements.weightKg = 78.5;

    const trends = listMeasurementTrends(current, previous);
    const weightTrend = trends.find((item) => item.field === 'weightKg');

    expect(weightTrend?.delta).toBe(1.5);
    expect(weightTrend?.positive).toBe(true);
  });
});
