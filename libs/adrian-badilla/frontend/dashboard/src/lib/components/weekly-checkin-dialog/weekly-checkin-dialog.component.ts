import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { ProgressBarModule } from 'primeng/progressbar';
import { ImageModule } from 'primeng/image';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { WEEKLY_CHECKIN_CONFIG, PROGRESS_PHOTO_LABELS } from '../../constants/weekly-checkin.constants';
import type {
  BodyMeasurements,
  ProgressPhotoType,
  ProgressPhotoUploadStatus,
} from '../../types/weekly-progress.types';
import { weeklyProgressStore } from '../../store/weekly-progress.store';

@Component({
  selector: 'lib-weekly-checkin-dialog',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    DialogModule,
    CheckboxModule,
    InputNumberModule,
    TextareaModule,
    ProgressBarModule,
    ImageModule,
    TagModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './weekly-checkin-dialog.component.html',
  styleUrl: './weekly-checkin-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyCheckinDialogComponent {
  readonly store = inject(weeklyProgressStore);
  readonly #confirmationService = inject(ConfirmationService);

  readonly visible = input.required<boolean>();
  readonly visibleChange = output<boolean>();

  readonly photoTypes = WEEKLY_CHECKIN_CONFIG.requiredPhotoTypes;
  readonly progressPhotoLabels = PROGRESS_PHOTO_LABELS;
  readonly currentCheckIn = computed(() => this.store.currentCheckIn());
  readonly overallUploadProgress = this.store.overallUploadProgress;
  readonly saveDisabledReason = this.store.saveDisabledReason;
  readonly loadingCurrentWeek = this.store.loadingCurrentWeek;

  readonly #ensureDraftOnOpen = effect(() => {
    if (!this.visible()) {
      return;
    }

    if (!this.store.currentCheckIn()) {
      this.store.ensureCurrentWeekDraft();
    }
  });

  close(): void {
    if (this.store.saving()) {
      return;
    }

    if (!this.store.hasUnsavedChanges()) {
      this.visibleChange.emit(false);
      return;
    }

    this.#confirmationService.confirm({
      header: 'Descartar cambios',
      message:
        'Hay cambios sin guardar en este check-in. Si cierras ahora, se descartaran los archivos seleccionados y los cambios del borrador local.',
      acceptLabel: 'Descartar',
      rejectLabel: 'Seguir editando',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        this.store.discardUnsavedChanges();
        await this.store.loadCurrentWeek();
        this.visibleChange.emit(false);
      },
    });
  }

  onFileSelected(type: ProgressPhotoType, event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0] ?? null;

    if (!file) {
      return;
    }

    void this.store.selectPhoto(type, file);
    if (input) {
      input.value = '';
    }
  }

  measurementValue(field: keyof BodyMeasurements): number | null {
    return this.currentCheckIn()?.measurements[field] ?? null;
  }

  updateMeasurement(field: keyof BodyMeasurements, value: number | null): void {
    this.store.updateMeasurements({
      [field]: value,
    });
  }

  updateSelfAssessment(field: keyof NonNullable<ReturnType<typeof this.currentCheckIn>>['selfAssessment'], value: number | null): void {
    this.store.updateSelfAssessment({
      [field]: value,
    });
  }

  photoPreview(type: ProgressPhotoType): string | null {
    const preview = this.store.previews()[type];
    const stored = this.currentCheckIn()?.photos[type];
    return preview ?? stored?.downloadUrl ?? stored?.thumbnailUrl ?? null;
  }

  photoStatus(type: ProgressPhotoType): ProgressPhotoUploadStatus {
    return this.store.photoStatuses()[type];
  }

  photoStatusLabel(type: ProgressPhotoType): string {
    switch (this.photoStatus(type)) {
      case 'preparing':
        return 'Preparando';
      case 'uploading':
        return 'Subiendo';
      case 'uploaded':
        return 'Subida';
      case 'failed':
        return 'Fallida';
      default:
        return this.photoPreview(type) ? 'Lista' : 'Pendiente';
    }
  }

  photoStatusSeverity(type: ProgressPhotoType): 'success' | 'warn' | 'danger' | 'secondary' {
    switch (this.photoStatus(type)) {
      case 'uploaded':
        return 'success';
      case 'preparing':
      case 'uploading':
        return 'warn';
      case 'failed':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  photoError(type: ProgressPhotoType): string | null {
    return this.store.photoErrors()[type] ?? null;
  }

  triggerRetry(type: ProgressPhotoType, input: HTMLInputElement): void {
    this.store.retryFailedPhoto(type);
    input.click();
  }

  deleteStoredPhoto(type: ProgressPhotoType): void {
    const hasStoredPhoto = !!this.currentCheckIn()?.photos[type];

    if (!hasStoredPhoto) {
      this.store.removeSelectedPhoto(type);
      return;
    }

    this.#confirmationService.confirm({
      header: 'Eliminar fotografia',
      message: `Se eliminara la foto ${this.progressPhotoLabels[type]} y el check-in volvera a estado borrador si deja de cumplir el minimo requerido.`,
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        await this.store.deleteStoredPhoto(type);
      },
    });
  }

  confirmDeleteCheckIn(): void {
    this.#confirmationService.confirm({
      header: 'Eliminar check-in semanal',
      message:
        'Se eliminaran las fotografias asociadas y el documento semanal. Esta accion no se puede deshacer.',
      acceptLabel: 'Eliminar check-in',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        await this.store.deleteCheckIn();
        if (!this.store.error()) {
          this.visibleChange.emit(false);
        }
      },
    });
  }

  submit(): void {
    void this.store.saveWeeklyCheckIn().then(() => {
      if (!this.store.error() && !this.store.hasUnsavedChanges()) {
        this.visibleChange.emit(false);
      }
    });
  }
}
