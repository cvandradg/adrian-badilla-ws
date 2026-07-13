import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { ChartModule } from 'primeng/chart';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { ProgressBarModule } from 'primeng/progressbar';
import { SkeletonModule } from 'primeng/skeleton';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { firebaseAuthStore } from '@adrian-badilla/auth';
import { athleteProfileStore } from '../../store/athlete-profile.store';
import { weeklyProgressStore } from '../../store/weekly-progress.store';
import { AthleteProfileCardComponent } from '../../components/athlete-profile-card/athlete-profile-card.component';
import { AthleteProfileFormComponent } from '../../components/athlete-profile-form/athlete-profile-form.component';
import { WeeklyCheckinDialogComponent } from '../../components/weekly-checkin-dialog/weekly-checkin-dialog.component';
import { SubscriptionManagementCardComponent } from '@adrian-badilla/billing';
import {
  MEASUREMENT_HISTORY_MOCK,
  USER_PROFILE_MOCK,
  type MeasurementSnapshot,
} from '../../mock/user-profile/user-profile.mock';
import {
  PROGRESS_PHOTO_LABELS,
  WEEKLY_CHECKIN_CONFIG,
} from '../../constants/weekly-checkin.constants';
import type {
  BodyMeasurements,
  ProgressPhotoType,
  WeeklyProgressCheckIn,
} from '../../types/weekly-progress.types';
import { getNextFriday } from '../../utils/weekly-checkin.utils';

type ProfileTab = 'resumen' | 'historial' | 'galeria';

function timestampToDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return value;
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof value.toDate === 'function'
  ) {
    return value.toDate();
  }

  return null;
}

function measurementOrFallback(
  checkIn: WeeklyProgressCheckIn | null | undefined,
  field: keyof BodyMeasurements,
  fallback: number
): number {
  return checkIn?.measurements[field] ?? fallback;
}

function checkInToSnapshot(
  checkIn: WeeklyProgressCheckIn,
  heightCm: number
): MeasurementSnapshot {
  const date = timestampToDate(checkIn.checkInDate) ?? new Date();
  const weightKg = checkIn.measurements.weightKg ?? 0;
  const bmi =
    heightCm > 0 && weightKg > 0
      ? +(weightKg / Math.pow(heightCm / 100, 2)).toFixed(1)
      : 0;

  return {
    id: checkIn.weekId,
    date: date.toISOString(),
    label: checkIn.weekId,
    weightKg,
    bodyFatPercent: checkIn.measurements.bodyFatPercent ?? 0,
    bmi,
    measurements: {
      chest: checkIn.measurements.chestCm ?? 0,
      waist: checkIn.measurements.waistCm ?? 0,
      hips: checkIn.measurements.hipCm ?? 0,
      bicepLeft: checkIn.measurements.leftArmCm ?? 0,
      bicepRight: checkIn.measurements.rightArmCm ?? 0,
      thighLeft: checkIn.measurements.thighCm ?? 0,
      calf: checkIn.measurements.calfCm ?? 0,
    },
  };
}

@Component({
  selector: 'lib-profile-page',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    ChartModule,
    AccordionModule,
    ButtonModule,
    ImageModule,
    ProgressBarModule,
    SkeletonModule,
    SelectModule,
    TagModule,
    AthleteProfileCardComponent,
    AthleteProfileFormComponent,
    WeeklyCheckinDialogComponent,
    SubscriptionManagementCardComponent,
  ],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePageComponent {
  readonly #router = inject(Router);
  readonly #dialogRef = inject<MatDialogRef<ProfilePageComponent>>(
    MatDialogRef,
    { optional: true }
  );
  readonly #auth = inject(firebaseAuthStore);
  readonly athleteStore = inject(athleteProfileStore);
  readonly weeklyStore = inject(weeklyProgressStore);

  readonly activeTab = signal<ProfileTab>('resumen');
  readonly checkInDialogVisible = signal(false);
  readonly historyExpandedMonth = signal<string | string[] | null>(null);
  readonly selectedGalleryMonthKey = signal<string | null>(null);
  readonly expandedGalleryWeekId = signal<string | null>(null);
  readonly initializedUid = signal<string | null>(null);

  readonly progressPhotoLabels = PROGRESS_PHOTO_LABELS;
  readonly requiredPhotoTypes = WEEKLY_CHECKIN_CONFIG.requiredPhotoTypes;

  readonly latestCheckIn = this.weeklyStore.latestCheckIn;
  readonly previousCheckIn = this.weeklyStore.previousCheckIn;
  readonly availableMonths = this.weeklyStore.availableMonths;
  readonly groupedCheckInsByMonth = this.weeklyStore.groupedCheckInsByMonth;
  readonly galleryMonthOptions = computed(() =>
    this.availableMonths().map((month) => ({
      label: month.label,
      value: month.monthKey,
    }))
  );
  readonly selectedGalleryMonth = computed(() => {
    const monthKey =
      this.selectedGalleryMonthKey() ?? this.availableMonths()[0]?.monthKey ?? null;

    if (!monthKey) {
      return null;
    }

    return this.availableMonths().find((month) => month.monthKey === monthKey) ?? null;
  });
  readonly galleryWeeks = computed(() => {
    const monthKey = this.selectedGalleryMonthKey();

    if (!monthKey) {
      return [];
    }

    return this.weeklyStore.monthlyCheckIns()[monthKey] ?? [];
  });

  readonly displayName = computed(
    () => this.#auth.userName() ?? USER_PROFILE_MOCK.name
  );
  readonly avatarUrl = computed(
    () => this.#auth.userPhoto() ?? USER_PROFILE_MOCK.avatarUrl
  );
  readonly ageYears = computed(
    () =>
      this.#auth.userProfile()?.healthProfile?.ageYears ??
      this.#auth.userProfile()?.ageYears ??
      USER_PROFILE_MOCK.age
  );
  readonly heightCm = computed(
    () =>
      this.#auth.userProfile()?.healthProfile?.heightCm ??
      this.#auth.userProfile()?.heightCm ??
      USER_PROFILE_MOCK.heightCm
  );
  readonly weightKg = computed(
    () =>
      this.latestCheckIn()?.measurements.weightKg ??
      this.#auth.userProfile()?.healthProfile?.weightKg ??
      this.#auth.userProfile()?.weightKg ??
      USER_PROFILE_MOCK.weightKg
  );
  readonly bodyFatPercent = computed(
    () =>
      this.latestCheckIn()?.measurements.bodyFatPercent ??
      this.#auth.userProfile()?.healthProfile?.bodyFatPercent ??
      this.#auth.userProfile()?.bodyFatPercent ??
      USER_PROFILE_MOCK.bodyFatPercent
  );
  readonly bmi = computed(() => {
    const stored = this.#auth.userProfile()?.healthProfile?.bmi;
    if (stored != null && !this.latestCheckIn()) {
      return stored;
    }

    const weightKg = this.weightKg();
    const heightCm = this.heightCm();

    if (!weightKg || !heightCm) {
      return 0;
    }

    return +(weightKg / Math.pow(heightCm / 100, 2)).toFixed(1);
  });

  readonly currentMeasurements = computed(() => ({
    chest: measurementOrFallback(
      this.latestCheckIn(),
      'chestCm',
      USER_PROFILE_MOCK.measurements.chest
    ),
    waist: measurementOrFallback(
      this.latestCheckIn(),
      'waistCm',
      USER_PROFILE_MOCK.measurements.waist
    ),
    hips: measurementOrFallback(
      this.latestCheckIn(),
      'hipCm',
      USER_PROFILE_MOCK.measurements.hips
    ),
    bicepLeft: measurementOrFallback(
      this.latestCheckIn(),
      'leftArmCm',
      USER_PROFILE_MOCK.measurements.bicepLeft
    ),
    bicepRight: measurementOrFallback(
      this.latestCheckIn(),
      'rightArmCm',
      USER_PROFILE_MOCK.measurements.bicepRight
    ),
    thighLeft: measurementOrFallback(
      this.latestCheckIn(),
      'thighCm',
      USER_PROFILE_MOCK.measurements.thighLeft
    ),
    calf: measurementOrFallback(
      this.latestCheckIn(),
      'calfCm',
      USER_PROFILE_MOCK.measurements.calf
    ),
  }));

  readonly historySnapshots = computed<MeasurementSnapshot[]>(() => {
    const realCheckIns = Object.values(this.weeklyStore.monthlyCheckIns())
      .flat()
      .sort((left, right) => right.weekId.localeCompare(left.weekId));

    if (realCheckIns.length === 0) {
      return MEASUREMENT_HISTORY_MOCK;
    }

    return realCheckIns.map((item) => checkInToSnapshot(item, this.heightCm()));
  });

  readonly lineChartData = computed(() => {
    const snaps = [...this.historySnapshots()].reverse();
    return {
      labels: snaps.map((item) => item.label),
      datasets: [
        {
          label: 'Peso (kg)',
          data: snaps.map((item) => item.weightKg),
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
          data: snaps.map((item) => item.bodyFatPercent),
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
    const snaps = this.historySnapshots();
    const current = snaps[0] ?? MEASUREMENT_HISTORY_MOCK[0];
    const initial = snaps.at(-1) ?? MEASUREMENT_HISTORY_MOCK.at(-1)!;
    return {
      labels: ['Pecho', 'Cintura', 'Caderas', 'Biceps', 'Muslo', 'Pantorrilla'],
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
    const snaps = [...this.historySnapshots()].reverse();
    return {
      labels: snaps.map((item) => item.label),
      datasets: [
        {
          label: 'Peso (kg)',
          data: snaps.map((item) => item.weightKg),
          backgroundColor: 'rgba(167, 139, 250, 0.55)',
          borderColor: '#a78bfa',
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: 'Grasa (kg)',
          data: snaps.map((item) =>
            +((item.weightKg * item.bodyFatPercent) / 100).toFixed(1)
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
    const weightKg = this.weightKg();
    const bodyFatPercent = this.bodyFatPercent();
    const fat = +((weightKg * bodyFatPercent) / 100).toFixed(1);
    const muscle = +(weightKg * 0.45).toFixed(1);
    const water = +(weightKg * 0.35).toFixed(1);
    const other = +Math.max(weightKg - fat - muscle - water, 0).toFixed(1);
    return {
      labels: ['Grasa', 'Musculo', 'Agua', 'Otros'],
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

  readonly nextFridayLabel = computed(() =>
    getNextFriday().toLocaleDateString('es-GT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  );
  readonly currentWeekPhotoCompletion = computed(() =>
    this.requiredPhotoTypes.filter(
      (type) =>
        this.weeklyStore.currentCheckIn()?.photos[type] ||
        this.weeklyStore.selectedFiles()[type]
    ).length
  );

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

  readonly #loadProfileData = effect(() => {
    const uid = this.#auth.userId();

    if (!uid || this.initializedUid() === uid) {
      return;
    }

    this.initializedUid.set(uid);
    void this.athleteStore.loadAthleteProfile();
    void this.weeklyStore.loadCurrentWeek();
    void this.weeklyStore.loadInitialMonths();
  });

  readonly #primeExpandedMonths = effect(() => {
    const firstMonth = this.availableMonths()[0]?.monthKey ?? null;

    if (firstMonth && this.historyExpandedMonth() == null) {
      this.historyExpandedMonth.set(firstMonth);
    }

    if (firstMonth && this.selectedGalleryMonthKey() == null) {
      this.selectedGalleryMonthKey.set(firstMonth);
      void this.weeklyStore.loadMonthCheckIns(firstMonth);
    }
  });

  setTab(tab: ProfileTab): void {
    this.activeTab.set(tab);
  }

  openWeeklyCheckInDialog(): void {
    this.weeklyStore.ensureCurrentWeekDraft();
    this.checkInDialogVisible.set(true);
  }

  async openHistoryMonth(monthKey: string): Promise<void> {
    this.historyExpandedMonth.set(monthKey);
    await this.weeklyStore.loadMonthCheckIns(monthKey);
  }

  async openGalleryMonth(monthKey: string | null): Promise<void> {
    if (!monthKey) {
      return;
    }

    this.selectedGalleryMonthKey.set(monthKey);
    this.expandedGalleryWeekId.set(null);
    await this.weeklyStore.loadMonthCheckIns(monthKey);
  }

  async loadMoreMonths(): Promise<void> {
    await this.weeklyStore.loadMoreMonths();
  }

  async selectWeekForGallery(week: WeeklyProgressCheckIn): Promise<void> {
    this.activeTab.set('galeria');
    this.selectedGalleryMonthKey.set(week.monthKey);
    this.expandedGalleryWeekId.set(week.weekId);
    await this.weeklyStore.selectWeek(week.weekId);
    await this.weeklyStore.loadMonthCheckIns(week.monthKey);
  }

  canEditWeek(week: WeeklyProgressCheckIn): boolean {
    return week.weekId === this.weeklyStore.currentWeekId();
  }

  statusSeverity(status: WeeklyProgressCheckIn['status'] | null | undefined) {
    switch (status) {
      case 'complete':
        return 'success';
      case 'failed':
        return 'danger';
      case 'uploading':
        return 'warn';
      default:
        return 'secondary';
    }
  }

  statusLabel(status: WeeklyProgressCheckIn['status'] | null | undefined): string {
    switch (status) {
      case 'complete':
        return 'Completo';
      case 'failed':
        return 'Fallido';
      case 'uploading':
        return 'Subiendo';
      default:
        return 'Borrador';
    }
  }

  weekDateLabel(week: WeeklyProgressCheckIn): string {
    const date = timestampToDate(week.checkInDate);

    if (!date) {
      return week.weekId;
    }

    return date.toLocaleDateString('es-GT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  weekMonthShortLabel(week: WeeklyProgressCheckIn): string {
    const date = timestampToDate(week.checkInDate);

    if (!date) {
      return 'SEM';
    }

    return date.toLocaleDateString('es-GT', {
      month: 'short',
    });
  }

  availablePhotoCount(week: WeeklyProgressCheckIn): number {
    return Object.values(week.photos).filter(Boolean).length;
  }

  lateSubmissionLabel(week: WeeklyProgressCheckIn): string | null {
    const date = timestampToDate(week.checkInDate);

    if (!date || date.getDay() === WEEKLY_CHECKIN_CONFIG.primaryDay) {
      return null;
    }

    return 'Envio tardio';
  }

  async editWeek(week: WeeklyProgressCheckIn): Promise<void> {
    if (!this.canEditWeek(week)) {
      return;
    }

    await this.weeklyStore.loadCurrentWeek();
    this.checkInDialogVisible.set(true);
  }

  toggleGalleryWeekDetails(weekId: string): void {
    this.expandedGalleryWeekId.update((current) =>
      current === weekId ? null : weekId
    );
  }

  isGalleryWeekExpanded(weekId: string): boolean {
    return this.expandedGalleryWeekId() === weekId;
  }

  galleryPhotoUrl(
    week: WeeklyProgressCheckIn,
    type: ProgressPhotoType
  ): string | null {
    const photo = week.photos[type];
    return photo?.downloadUrl ?? photo?.thumbnailUrl ?? null;
  }

  galleryWeekStatusLabel(week: WeeklyProgressCheckIn): string {
    const count = this.availablePhotoCount(week);

    if (count === this.requiredPhotoTypes.length) {
      return 'Completo';
    }

    if (count > 0) {
      return 'Parcial';
    }

    return 'Incompleto';
  }

  galleryWeekStatusClass(week: WeeklyProgressCheckIn): string {
    const count = this.availablePhotoCount(week);

    if (count === this.requiredPhotoTypes.length) {
      return 'is-complete';
    }

    if (count > 0) {
      return 'is-partial';
    }

    return 'is-incomplete';
  }

  galleryMonthAriaLabel(): string {
    const selectedMonth = this.selectedGalleryMonth();
    return selectedMonth
      ? `Mes de galeria seleccionado: ${selectedMonth.label}`
      : 'Seleccionar mes de galeria';
  }

  goBack(): void {
    if (this.#dialogRef) {
      this.#dialogRef.close();
      return;
    }

    this.#router.navigate(['/dashboard/inicio']);
  }

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
