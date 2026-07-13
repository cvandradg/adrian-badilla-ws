import { signalStore } from '@ngrx/signals';
import { withWeeklyProgressCheckInsFeature } from './with-weekly-progress-checkins.feature';

export const weeklyProgressStore = signalStore(
  { providedIn: 'root' },
  withWeeklyProgressCheckInsFeature()
);

export type WeeklyProgressStore = InstanceType<typeof weeklyProgressStore>;
