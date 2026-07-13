export type ProgressPhotoType = 'front' | 'side' | 'back';

export type WeeklyCheckInStatus =
  | 'draft'
  | 'uploading'
  | 'complete'
  | 'failed';

export type ProgressPhotoUploadStatus =
  | 'idle'
  | 'preparing'
  | 'uploading'
  | 'uploaded'
  | 'failed';

export type WeeklyProgressSource = 'weekly_checkin' | 'legacy_monthly' | 'demo';

export interface ProgressPhotoMetadata {
  type: ProgressPhotoType;
  storagePath: string;
  thumbnailPath?: string;
  downloadUrl?: string;
  thumbnailUrl?: string;
  contentType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  versionToken?: string;
  uploadedAt: unknown;
}

export interface BodyMeasurements {
  weightKg: number | null;
  bodyFatPercent: number | null;
  chestCm: number | null;
  waistCm: number | null;
  hipCm: number | null;
  leftArmCm: number | null;
  rightArmCm: number | null;
  thighCm: number | null;
  calfCm: number | null;
}

export interface WeeklySelfAssessment {
  energy: number | null;
  hunger: number | null;
  soreness: number | null;
  stress: number | null;
  motivation: number | null;
  sleepAverageHours: number | null;
  dietAdherencePercent: number | null;
  workoutsCompleted: number | null;
  workoutsPlanned: number | null;
}

export interface WeeklyProgressCheckIn {
  id: string;
  weekId: string;
  year: number;
  month: number;
  monthKey: string;
  weekOfMonth: number;
  userId: string;
  checkInDate: unknown;
  status: WeeklyCheckInStatus;
  measurements: BodyMeasurements;
  photos: Partial<Record<ProgressPhotoType, ProgressPhotoMetadata>>;
  selfAssessment: WeeklySelfAssessment;
  notes: string;
  consentVersion?: string;
  source: WeeklyProgressSource;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface ProgressPhotoConsent {
  consented: boolean;
  version: string;
  purpose: 'weekly_progress_tracking';
  acceptedAt: unknown;
}

export interface AvailableProgressMonth {
  monthKey: string;
  year: number;
  month: number;
  label: string;
  checkInCount: number;
  latestWeekId: string | null;
}

export interface AvailableProgressMonthsPage {
  months: AvailableProgressMonth[];
  hasMore: boolean;
}

export interface GroupedWeeklyProgressMonth {
  monthKey: string;
  year: number;
  month: number;
  label: string;
  checkInCount: number;
  weeks: WeeklyProgressCheckIn[];
}

export interface GroupedWeeklyProgressYear {
  year: number;
  months: GroupedWeeklyProgressMonth[];
}

export interface WeeklyMeasurementTrend {
  field: keyof BodyMeasurements;
  current: number | null;
  previous: number | null;
  delta: number | null;
  positive: boolean | null;
}

export interface PreparedProgressImage {
  mainBlob: Blob;
  thumbnailBlob: Blob;
  contentType: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
}

export interface StoredProgressPhotoPayload {
  type: ProgressPhotoType;
  storagePath: string;
  thumbnailPath?: string;
  contentType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  versionToken: string;
}

export interface ProgressPhotoDeletionResult {
  deletedPaths: string[];
  failedPaths: string[];
}

export interface ProgressImageValidationResult {
  valid: boolean;
  error: string | null;
}

export interface ProgressAnalysisContext {
  latestCheckIns: WeeklyProgressCheckIn[];
  weightChangesKg: number[];
  measurementChanges: Partial<Record<keyof BodyMeasurements, number[]>>;
  dietAdherencePercent: number[];
  sleepAverageHours: number[];
  energy: number[];
  stress: number[];
  motivation: number[];
  notes: string[];
}
