import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DataViewModule } from 'primeng/dataview';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { exerciseLibraryStore } from '../../store/exercise-library.store';
import { ExerciseFormDialogComponent } from '../../components/exercise-form-dialog/exercise-form-dialog.component';
import { BulkExerciseImporterDialogComponent } from '../../components/bulk-exercise-importer-dialog/bulk-exercise-importer-dialog.component';
import type { Exercise } from '../../models/exercise.model';
import {
  EXERCISE_CATEGORY_CATALOG,
  MUSCLE_CATALOG,
  TRAINING_LOCATION_CATALOG,
  EQUIPMENT_CATALOG,
  LEVEL_CATALOG,
  labelById,
  labelsById,
} from '../../shared/catalogs';

@Component({
  selector: 'admin-exercise-library-page',
  standalone: true,
  imports: [
    ToolbarModule,
    ButtonModule,
    InputTextModule,
    DataViewModule,
    SkeletonModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    AvatarModule,
    TooltipModule,
    FormsModule,
  ],
  providers: [DialogService, MessageService, ConfirmationService],
  templateUrl: './exercise-library-page.component.html',
  styleUrl: './exercise-library-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExerciseLibraryPageComponent {
  readonly store = inject(exerciseLibraryStore);
  private readonly dialogService = inject(DialogService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  // ── Search binding ────────────────────────────────────────────────────────
  readonly searchValue = signal('');

  // ── Initialize live stream ────────────────────────────────────────────────
  private readonly _init = this.store.refresh(undefined);

  // ── Search handler ────────────────────────────────────────────────────────
  onSearch(value: string): void {
    this.searchValue.set(value);
    this.store.searchExercises(value);
  }

  // ── Dialog: New Exercise ─────────────────────────────────────────────────
  openCreateDialog(): void {
    this.store.selectExercise(null);
    this.store.clearSaveResult();
    const ref = this.dialogService.open(ExerciseFormDialogComponent, {
      header: 'Nuevo Ejercicio',
      modal: true,
      closable: true,
      dismissableMask: false,
      styleClass: 'exercise-dialog',
      style: { width: 'min(96vw, 860px)', maxHeight: '94vh' },
      data: { exercise: null },
    });

    ref?.onClose.subscribe((saved: boolean) => {
      if (saved) {
        this.messageService.add({
          severity: 'success',
          summary: 'Ejercicio creado',
          detail: 'El ejercicio fue guardado exitosamente.',
          life: 3000,
        });
      }
    });
  }

  openBulkImporterDialog(): void {
    const ref = this.dialogService.open(BulkExerciseImporterDialogComponent, {
      header: 'Importar ejercicios',
      modal: true,
      closable: true,
      dismissableMask: false,
      styleClass: 'exercise-dialog',
      style: { width: 'min(96vw, 1100px)', maxHeight: '94vh' },
    });

    ref?.onClose.subscribe((result: { savedCount: number } | null) => {
      if (result?.savedCount) {
        this.messageService.add({
          severity: 'success',
          summary: 'Importación completada',
          detail: `${result.savedCount} ejercicios guardados para revisión posterior.`,
          life: 3000,
        });
      }
    });
  }

  // ── Dialog: Edit Exercise ────────────────────────────────────────────────
  openEditDialog(exercise: Exercise): void {
    this.store.selectExercise(exercise);
    this.store.clearSaveResult();
    const ref = this.dialogService.open(ExerciseFormDialogComponent, {
      header: 'Editar Ejercicio',
      modal: true,
      closable: true,
      dismissableMask: false,
      styleClass: 'exercise-dialog',
      style: { width: 'min(96vw, 860px)', maxHeight: '94vh' },
      data: { exercise },
    });

    ref?.onClose.subscribe((saved: boolean) => {
      if (saved) {
        this.messageService.add({
          severity: 'success',
          summary: 'Ejercicio actualizado',
          detail: 'Los cambios fueron guardados exitosamente.',
          life: 3000,
        });
        this.store.selectExercise(null);
      }
    });
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  confirmDelete(exercise: Exercise): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar "<strong>${exercise.name}</strong>"? Esta acción no se puede deshacer.`,
      header: 'Eliminar ejercicio',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.store.deleteExercise(exercise.id);
        this.messageService.add({
          severity: 'info',
          summary: 'Ejercicio eliminado',
          life: 3000,
        });
      },
    });
  }

  // ── Duplicate ─────────────────────────────────────────────────────────────
  duplicateExercise(exercise: Exercise): void {
    this.store.duplicateExercise(exercise);
    this.messageService.add({
      severity: 'info',
      summary: 'Ejercicio duplicado',
      detail: `"${exercise.name} (Copy)" fue creado.`,
      life: 3000,
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  technicalDifficultyLabel(id: string): string {
    return labelById(LEVEL_CATALOG, id);
  }

  exerciseCategoryLabel(id: string): string {
    return labelById(EXERCISE_CATEGORY_CATALOG, id);
  }

  /** Returns the Spanish label for the first primary muscle */
  primaryMuscleLabel(ids: string[]): string {
    return ids.length ? labelById(MUSCLE_CATALOG, ids[0]) : '';
  }

  /** Returns comma-separated Spanish labels for training locations */
  locationLabels(ids: string[]): string {
    return labelsById(TRAINING_LOCATION_CATALOG, ids, ' / ');
  }

  /** Returns the first equipment label */
  firstEquipmentLabel(ids: string[]): string {
    return ids.length ? labelById(EQUIPMENT_CATALOG, ids[0]) : '';
  }

  technicalDifficultyTag(
    id: string
  ):
    | 'success'
    | 'warn'
    | 'danger'
    | 'info'
    | 'secondary'
    | 'contrast'
    | undefined {
    const map: Record<string, 'success' | 'warn' | 'danger'> = {
      low: 'success',
      medium: 'warn',
      high: 'danger',
    };
    return map[id];
  }

  skeletonItems = Array.from({ length: 6 });
}
