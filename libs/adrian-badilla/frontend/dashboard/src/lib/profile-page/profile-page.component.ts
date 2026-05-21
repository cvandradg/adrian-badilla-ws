import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { DecimalPipe, DatePipe } from '@angular/common';
import {
  USER_PROFILE_MOCK,
  MEASUREMENT_HISTORY_MOCK,
  type UserProfileMock,
  type ProgressPhoto,
  type MeasurementSnapshot,
} from '../mock/user-profile/user-profile.mock';

type ProfileTab = 'resumen' | 'historial';

@Component({
  selector: 'lib-profile-page',
  standalone: true,
  imports: [DecimalPipe, DatePipe],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePageComponent {
  readonly #router = inject(Router);
  readonly #dialogRef = inject<MatDialogRef<ProfilePageComponent>>(MatDialogRef, { optional: true });

  readonly profile = signal<UserProfileMock>(USER_PROFILE_MOCK);
  readonly history = signal<MeasurementSnapshot[]>(MEASUREMENT_HISTORY_MOCK);
  readonly activeTab = signal<ProfileTab>('resumen');

  readonly selectedPhoto = signal<ProgressPhoto | null>(
    USER_PROFILE_MOCK.progressPhotos[0] ?? null
  );

  readonly bmi = computed(() => {
    const p = this.profile();
    const heightM = p.heightCm / 100;
    return +(p.weightKg / (heightM * heightM)).toFixed(1);
  });

  selectPhoto(photo: ProgressPhoto): void {
    this.selectedPhoto.set(photo);
  }

  setTab(tab: ProfileTab): void {
    this.activeTab.set(tab);
  }

  goBack(): void {
    if (this.#dialogRef) {
      this.#dialogRef.close();
    } else {
      this.#router.navigate(['/dashboard/inicio']);
    }
  }

  /** Delta between snapshot at index and previous one (null for last item). */
  getDelta(
    history: MeasurementSnapshot[],
    index: number,
    key: keyof Pick<MeasurementSnapshot, 'weightKg' | 'bodyFatPercent' | 'bmi'>
  ): { value: number; positive: boolean } | null {
    const next = history[index + 1];
    if (!next) return null;
    const delta = history[index][key] - next[key];
    return { value: +Math.abs(delta).toFixed(1), positive: delta > 0 };
  }

  getMeasurementDelta(
    history: MeasurementSnapshot[],
    index: number,
    key: keyof MeasurementSnapshot['measurements']
  ): { value: number; positive: boolean } | null {
    const next = history[index + 1];
    if (!next) return null;
    const delta =
      history[index].measurements[key] - next.measurements[key];
    return { value: +Math.abs(delta).toFixed(1), positive: delta > 0 };
  }
}
