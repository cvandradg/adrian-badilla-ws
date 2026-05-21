export interface BodyMeasurements {
  chest: number;
  waist: number;
  hips: number;
  bicepLeft: number;
  bicepRight: number;
  thighLeft: number;
  calf: number;
}

export interface MeasurementSnapshot {
  id: string;
  date: string;
  label: string;
  weightKg: number;
  bodyFatPercent: number;
  bmi: number;
  measurements: BodyMeasurements;
}

export interface ProgressPhoto {
  id: string;
  date: string;
  url: string;
  label: string;
}

export interface UserProfileMock {
  id: string;
  name: string;
  avatarUrl: string;
  age: number;
  weightKg: number;
  heightCm: number;
  fitnessGoal: string;
  bodyFatPercent: number;
  measurements: BodyMeasurements;
  progressPhotos: ProgressPhoto[];
}

export const USER_PROFILE_MOCK: UserProfileMock = {
  id: 'T7eoekKP2YarbxJvIMbo',
  name: 'Adrián Badilla',
  avatarUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&q=80',
  age: 27,
  weightKg: 82.5,
  heightCm: 178,
  fitnessGoal: 'Ganancia de masa muscular limpia',
  bodyFatPercent: 14.2,
  measurements: {
    chest: 106,
    waist: 80,
    hips: 98,
    bicepLeft: 38,
    bicepRight: 39,
    thighLeft: 60,
    calf: 38,
  },
  progressPhotos: [
    {
      id: 'pp-01',
      date: '2026-05-01',
      url: 'https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?w=300&q=80',
      label: 'Mayo 2026',
    },
    {
      id: 'pp-02',
      date: '2026-03-01',
      url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=300&q=80',
      label: 'Marzo 2026',
    },
    {
      id: 'pp-03',
      date: '2026-01-01',
      url: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=300&q=80',
      label: 'Enero 2026',
    },
    {
      id: 'pp-04',
      date: '2025-10-01',
      url: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=300&q=80',
      label: 'Oct 2025',
    },
  ],
};

export const MEASUREMENT_HISTORY_MOCK: MeasurementSnapshot[] = [
  {
    id: 'ms-01',
    date: '2026-05-01',
    label: 'Mayo 2026',
    weightKg: 82.5,
    bodyFatPercent: 14.2,
    bmi: 26,
    measurements: { chest: 106, waist: 80, hips: 98, bicepLeft: 38, bicepRight: 39, thighLeft: 60, calf: 38 },
  },
  {
    id: 'ms-02',
    date: '2026-03-01',
    label: 'Marzo 2026',
    weightKg: 80.1,
    bodyFatPercent: 15.8,
    bmi: 25.3,
    measurements: { chest: 104, waist: 82, hips: 97, bicepLeft: 37, bicepRight: 37.5, thighLeft: 59, calf: 37 },
  },
  {
    id: 'ms-03',
    date: '2026-01-01',
    label: 'Enero 2026',
    weightKg: 77.4,
    bodyFatPercent: 17.1,
    bmi: 24.4,
    measurements: { chest: 102, waist: 85, hips: 96, bicepLeft: 36, bicepRight: 36, thighLeft: 57, calf: 36.5 },
  },
  {
    id: 'ms-04',
    date: '2025-10-01',
    label: 'Oct 2025',
    weightKg: 75,
    bodyFatPercent: 18.5,
    bmi: 23.7,
    measurements: { chest: 100, waist: 87, hips: 95, bicepLeft: 35, bicepRight: 35.5, thighLeft: 56, calf: 35 },
  },
  {
    id: 'ms-05',
    date: '2025-07-01',
    label: 'Jul 2025',
    weightKg: 73.2,
    bodyFatPercent: 19.8,
    bmi: 23.1,
    measurements: { chest: 99, waist: 89, hips: 94, bicepLeft: 34, bicepRight: 34.5, thighLeft: 54, calf: 34 },
  },
];
