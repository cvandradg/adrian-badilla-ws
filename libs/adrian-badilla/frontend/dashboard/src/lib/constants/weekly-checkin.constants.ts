import type { ProgressPhotoType } from '../types/weekly-progress.types';

export const WEEKLY_CHECKIN_CONFIG = {
  primaryDay: 5,
  allowLateSubmissionDays: 2,
  requiredPhotoTypes: ['front', 'side', 'back'] as ProgressPhotoType[],
  maxImageSizeBytes: 10 * 1024 * 1024,
  consentVersion: '1.0',
  recentMonthsLimit: 6,
} as const;

export const PROGRESS_PHOTO_LABELS: Record<ProgressPhotoType, string> = {
  front: 'Frontal',
  side: 'Lateral',
  back: 'Posterior',
};
