import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { DecimalPipe, DatePipe } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import {
  USER_PROFILE_MOCK,
  MEASUREMENT_HISTORY_MOCK,
  type UserProfileMock,
  type ProgressPhoto,
  type MeasurementSnapshot,
} from '../../mock/user-profile/user-profile.mock';
import { firebaseAuthStore } from '@adrian-badilla/auth';
import { athleteProfileStore } from '../../store/athlete-profile.store';
import { AthleteProfileCardComponent } from '../../components/athlete-profile-card/athlete-profile-card.component';
import { AthleteProfileFormComponent } from '../../components/athlete-profile-form/athlete-profile-form.component';
import { SubscriptionManagementCardComponent } from '@adrian-badilla/billing';

type ProfileTab = 'resumen' | 'historial' | 'galeria';

@Component({
  selector: 'lib-profile-page',
  standalone: true,
  imports: [
    DecimalPipe,
    DatePipe,
    ChartModule,
    AthleteProfileCardComponent,
    AthleteProfileFormComponent,
    SubscriptionManagementCardComponent,
  ],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePageComponent implements OnInit {
  readonly #router = inject(Router);
  readonly #dialogRef = inject<MatDialogRef<ProfilePageComponent>>(
    MatDialogRef,
    { optional: true }
  );
  readonly #auth = inject(firebaseAuthStore);
  readonly athleteStore = inject(athleteProfileStore);

  readonly profile = signal<UserProfileMock>(USER_PROFILE_MOCK);
  readonly history = signal<MeasurementSnapshot[]>(MEASUREMENT_HISTORY_MOCK);
  readonly activeTab = signal<ProfileTab>('resumen');

  readonly selectedPhoto = signal<ProgressPhoto | null>(
    USER_PROFILE_MOCK.progressPhotos[0] ?? null
  );

  /** Display name: uses Firebase user when available, falls back to mock. */
  readonly displayName = computed(
    () => this.#auth.userName() ?? this.profile().name
  );

  /** Avatar URL: uses Firebase photo when available, falls back to mock. */
  readonly avatarUrl = computed(
    () => this.#auth.userPhoto() ?? this.profile().avatarUrl
  );

  /** Physical stats: use real Firestore data when available, fall back to mock. */
  readonly weightKg = computed(
    () => this.#auth.userProfile()?.weightKg ?? this.profile().weightKg
  );
  readonly heightCm = computed(
    () => this.#auth.userProfile()?.heightCm ?? this.profile().heightCm
  );
  readonly ageYears = computed(
    () => this.#auth.userProfile()?.ageYears ?? this.profile().age
  );
  readonly bodyFatPercent = computed(
    () =>
      this.#auth.userProfile()?.bodyFatPercent ?? this.profile().bodyFatPercent
  );

  readonly bmi = computed(() => {
    const h = this.heightCm() / 100;
    return +(this.weightKg() / (h * h)).toFixed(1);
  });

  // ── Chart Data ─────────────────────────────────────────────────────────

  readonly lineChartData = computed(() => {
    const snaps = [...this.history()].reverse();
    return {
      labels: snaps.map((s) => s.label),
      datasets: [
        {
          label: 'Peso (kg)',
          data: snaps.map((s) => s.weightKg),
          borderColor: '#a78bfa',
          backgroundColor: 'rgba(167, 139, 250, 0.08)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#a78bfa',
          pointRadius: 4,
          pointHoverRadius: 6,
          yAxisID: 'y',
        },
        {
          label: 'Grasa %',
          data: snaps.map((s) => s.bodyFatPercent),
          borderColor: '#f87171',
          backgroundColor: 'rgba(248, 113, 113, 0.06)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#f87171',
          pointRadius: 4,
          pointHoverRadius: 6,
          yAxisID: 'y2',
        },
      ],
    };
  });

  readonly radarChartData = computed(() => {
    const snaps = this.history();
    const current = snaps[0];
    const initial = snaps.at(-1)!;
    return {
      labels: ['Pecho', 'Cintura', 'Caderas', 'Bíceps', 'Muslo', 'Pantorrilla'],
      datasets: [
        {
          label: 'Actual',
          data: [
            current.measurements.chest,
            current.measurements.waist,
            current.measurements.hips,
            current.measurements.bicepRight,
            current.measurements.thighLeft,
            current.measurements.calf,
          ],
          borderColor: '#a78bfa',
          backgroundColor: 'rgba(167, 139, 250, 0.18)',
          pointBackgroundColor: '#a78bfa',
          pointRadius: 4,
        },
        {
          label: 'Inicial',
          data: [
            initial.measurements.chest,
            initial.measurements.waist,
            initial.measurements.hips,
            initial.measurements.bicepRight,
            initial.measurements.thighLeft,
            initial.measurements.calf,
          ],
          borderColor: '#34d399',
          backgroundColor: 'rgba(52, 211, 153, 0.1)',
          pointBackgroundColor: '#34d399',
          pointRadius: 4,
        },
      ],
    };
  });

  readonly barChartData = computed(() => {
    const snaps = [...this.history()].reverse();
    return {
      labels: snaps.map((s) => s.label),
      datasets: [
        {
          label: 'Peso (kg)',
          data: snaps.map((s) => s.weightKg),
          backgroundColor: 'rgba(167, 139, 250, 0.55)',
          borderColor: '#a78bfa',
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: 'Grasa (kg)',
          data: snaps.map(
            (s) => +((s.weightKg * s.bodyFatPercent) / 100).toFixed(1)
          ),
          backgroundColor: 'rgba(248, 113, 113, 0.45)',
          borderColor: '#f87171',
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    };
  });

  readonly doughnutChartData = computed(() => {
    const w = this.weightKg();
    const bf = this.bodyFatPercent();
    const fat = +((w * bf) / 100).toFixed(1);
    const muscle = +(w * 0.45).toFixed(1);
    const water = +(w * 0.35).toFixed(1);
    const other = +Math.max(w - fat - muscle - water, 0).toFixed(1);
    return {
      labels: ['Grasa', 'Músculo', 'Agua', 'Otros'],
      datasets: [
        {
          data: [fat, muscle, water, other],
          backgroundColor: [
            'rgba(248, 113, 113, 0.75)',
            'rgba(167, 139, 250, 0.75)',
            'rgba(96, 165, 250, 0.75)',
            'rgba(148, 163, 184, 0.45)',
          ],
          borderColor: ['#f87171', '#a78bfa', '#60a5fa', '#94a3b8'],
          borderWidth: 1,
          hoverOffset: 8,
        },
      ],
    };
  });

  // ── Chart Options ──────────────────────────────────────────────────────

  readonly lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    animation: { duration: 600 },
    plugins: {
      legend: {
        labels: {
          color: 'rgba(241,245,249,0.65)',
          font: { size: 11 },
          boxWidth: 12,
          padding: 12,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#94a3b8', font: { size: 10 } },
      },
      y: {
        position: 'left' as const,
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#94a3b8', font: { size: 10 } },
      },
      y2: {
        position: 'right' as const,
        grid: { drawOnChartArea: false },
        ticks: { color: '#94a3b8', font: { size: 10 } },
      },
    },
  };

  readonly radarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 600 },
    plugins: {
      legend: {
        labels: {
          color: 'rgba(241,245,249,0.65)',
          font: { size: 11 },
          boxWidth: 12,
          padding: 12,
        },
      },
    },
    scales: {
      r: {
        grid: { color: 'rgba(255,255,255,0.08)' },
        ticks: {
          color: '#94a3b8',
          backdropColor: 'transparent',
          font: { size: 9 },
        },
        pointLabels: { color: 'rgba(241,245,249,0.7)', font: { size: 10 } },
      },
    },
  };

  readonly barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 600 },
    plugins: {
      legend: {
        labels: {
          color: 'rgba(241,245,249,0.65)',
          font: { size: 11 },
          boxWidth: 12,
          padding: 12,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#94a3b8', font: { size: 10 } },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#94a3b8', font: { size: 10 } },
      },
    },
  };

  readonly doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 600 },
    cutout: '65%',
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: 'rgba(241,245,249,0.65)',
          font: { size: 11 },
          padding: 12,
          boxWidth: 12,
        },
      },
    },
  };

  // ── Lifecycle ──────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.athleteStore.loadAthleteProfile();
  }

  // ── Actions ────────────────────────────────────────────────────────────

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
    const delta = history[index].measurements[key] - next.measurements[key];
    return { value: +Math.abs(delta).toFixed(1), positive: delta > 0 };
  }
}
