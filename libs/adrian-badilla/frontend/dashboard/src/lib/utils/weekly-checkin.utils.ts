import {
  WEEKLY_CHECKIN_CONFIG,
} from '../constants/weekly-checkin.constants';
import type {
  AvailableProgressMonth,
  BodyMeasurements,
  GroupedWeeklyProgressYear,
  ProgressPhotoType,
  WeeklyMeasurementTrend,
  WeeklyProgressCheckIn,
} from '../types/weekly-progress.types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getIsoWeekData(date: Date): {
  year: number;
  week: number;
} {
  const utcDate = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((utcDate.getTime() - yearStart.getTime()) / MS_PER_DAY + 1) / 7
  );

  return {
    year: utcDate.getUTCFullYear(),
    week,
  };
}

export function getCurrentIsoWeekId(referenceDate = new Date()): string {
  const { year, week } = getIsoWeekData(referenceDate);

  return `${year}-W${String(week).padStart(2, '0')}`;
}

export function getMonthKey(referenceDate: Date): string {
  return `${referenceDate.getFullYear()}-${String(
    referenceDate.getMonth() + 1
  ).padStart(2, '0')}`;
}

export function getWeekOfMonth(referenceDate: Date): number {
  const firstDayOfMonth = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    1
  );
  const offset = firstDayOfMonth.getDay();

  return Math.ceil((referenceDate.getDate() + offset) / 7);
}

export function getNextFriday(referenceDate = new Date()): Date {
  const date = startOfDay(referenceDate);
  const currentDay = date.getDay();
  const daysUntilFriday =
    (WEEKLY_CHECKIN_CONFIG.primaryDay - currentDay + 7) % 7;

  if (daysUntilFriday === 0) {
    return date;
  }

  date.setDate(date.getDate() + daysUntilFriday);
  return date;
}

export function isCheckInWindowOpen(referenceDate = new Date()): boolean {
  const day = startOfDay(referenceDate).getDay();
  const lateDays =
    WEEKLY_CHECKIN_CONFIG.allowLateSubmissionDays;

  return (
    day === WEEKLY_CHECKIN_CONFIG.primaryDay ||
    day === (WEEKLY_CHECKIN_CONFIG.primaryDay + 1) % 7 ||
    day === (WEEKLY_CHECKIN_CONFIG.primaryDay + lateDays) % 7
  );
}

export function createEmptyMeasurements(): BodyMeasurements {
  return {
    weightKg: null,
    bodyFatPercent: null,
    chestCm: null,
    waistCm: null,
    hipCm: null,
    leftArmCm: null,
    rightArmCm: null,
    thighCm: null,
    calfCm: null,
  };
}

export function createEmptySelfAssessment() {
  return {
    energy: null,
    hunger: null,
    soreness: null,
    stress: null,
    motivation: null,
    sleepAverageHours: null,
    dietAdherencePercent: null,
    workoutsCompleted: null,
    workoutsPlanned: null,
  };
}

export function createDraftCheckIn(input: {
  uid: string;
  referenceDate?: Date;
}): WeeklyProgressCheckIn {
  const referenceDate = input.referenceDate ?? new Date();
  const currentWeekId = getCurrentIsoWeekId(referenceDate);
  const checkInDate = getNextFriday(referenceDate);

  return {
    id: currentWeekId,
    weekId: currentWeekId,
    year: checkInDate.getFullYear(),
    month: checkInDate.getMonth() + 1,
    monthKey: getMonthKey(checkInDate),
    weekOfMonth: getWeekOfMonth(checkInDate),
    userId: input.uid,
    checkInDate,
    status: 'draft',
    measurements: createEmptyMeasurements(),
    photos: {},
    selfAssessment: createEmptySelfAssessment(),
    notes: '',
    source: 'weekly_checkin',
    createdAt: null,
    updatedAt: null,
  };
}

export function hasRequiredProgressPhotos(
  photos: Partial<Record<ProgressPhotoType, unknown>>
): boolean {
  return WEEKLY_CHECKIN_CONFIG.requiredPhotoTypes.every((type) => !!photos[type]);
}

export function validateProgressImageFile(file: File): {
  valid: boolean;
  error: string | null;
} {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Solo se permiten imagenes JPEG, PNG o WebP.',
    };
  }

  if (file.size > WEEKLY_CHECKIN_CONFIG.maxImageSizeBytes) {
    return {
      valid: false,
      error: 'La imagen supera el maximo de 10 MB.',
    };
  }

  return {
    valid: true,
    error: null,
  };
}

export function hasValidRequiredMeasurements(
  measurements: BodyMeasurements
): boolean {
  return (
    typeof measurements.weightKg === 'number' &&
    Number.isFinite(measurements.weightKg) &&
    measurements.weightKg > 0
  );
}

export function groupCheckInsByYearMonth(
  checkIns: WeeklyProgressCheckIn[],
  months: AvailableProgressMonth[] = []
): GroupedWeeklyProgressYear[] {
  const monthIndex = new Map(months.map((month) => [month.monthKey, month]));
  const groupedYears = new Map<number, Map<string, WeeklyProgressCheckIn[]>>();

  for (const checkIn of checkIns) {
    const yearBucket = groupedYears.get(checkIn.year) ?? new Map();
    const monthBucket = yearBucket.get(checkIn.monthKey) ?? [];
    monthBucket.push(checkIn);
    yearBucket.set(checkIn.monthKey, monthBucket);
    groupedYears.set(checkIn.year, yearBucket);
  }

  return [...groupedYears.entries()]
    .sort((left, right) => right[0] - left[0])
    .map(([year, monthMap]) => ({
      year,
      months: [...monthMap.entries()]
        .sort((left, right) => right[0].localeCompare(left[0]))
        .map(([monthKey, weekList]) => {
          const monthSummary = monthIndex.get(monthKey);

          return {
            monthKey,
            year,
            month: monthSummary?.month ?? weekList[0]?.month ?? 1,
            label:
              monthSummary?.label ??
              new Intl.DateTimeFormat('es-GT', {
                month: 'long',
                year: 'numeric',
              }).format(new Date(year, (weekList[0]?.month ?? 1) - 1, 1)),
            checkInCount: monthSummary?.checkInCount ?? weekList.length,
            weeks: [...weekList].sort((leftWeek, rightWeek) =>
              String(rightWeek.weekId).localeCompare(String(leftWeek.weekId))
            ),
          };
        }),
    }));
}

export function buildMeasurementTrend(
  current: WeeklyProgressCheckIn | null,
  previous: WeeklyProgressCheckIn | null,
  field: keyof BodyMeasurements
): WeeklyMeasurementTrend {
  const currentValue = current?.measurements[field] ?? null;
  const previousValue = previous?.measurements[field] ?? null;

  if (currentValue == null || previousValue == null) {
    return {
      field,
      current: currentValue,
      previous: previousValue,
      delta: null,
      positive: null,
    };
  }

  const delta = +(currentValue - previousValue).toFixed(1);

  return {
    field,
    current: currentValue,
    previous: previousValue,
    delta,
    positive: delta > 0,
  };
}

export function listMeasurementTrends(
  current: WeeklyProgressCheckIn | null,
  previous: WeeklyProgressCheckIn | null
): WeeklyMeasurementTrend[] {
  return (Object.keys(createEmptyMeasurements()) as Array<keyof BodyMeasurements>).map(
    (field) => buildMeasurementTrend(current, previous, field)
  );
}

export function formatMonthLabel(year: number, month: number): string {
  return new Intl.DateTimeFormat('es-GT', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1));
}
