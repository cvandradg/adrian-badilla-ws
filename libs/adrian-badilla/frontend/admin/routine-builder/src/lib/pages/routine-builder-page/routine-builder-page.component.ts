import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DialogService } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { routineBuilderStore } from '../../store/routine-builder.store';
import { RoutineFormDialogComponent } from '../../components/routine-form-dialog/routine-form-dialog.component';
import type { RoutineTemplate } from '../../models/routine.model';
import {
  ROUTINE_DIFFICULTY_CATALOG,
  routineLabelById,
} from '../../models/routine.model';

@Component({
  selector: 'admin-routine-builder-page',
  standalone: true,
  imports: [
    FormsModule,
    ToolbarModule,
    ButtonModule,
    InputTextModule,
    SkeletonModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
  ],
  providers: [DialogService, MessageService, ConfirmationService],
  templateUrl: './routine-builder-page.component.html',
  styleUrl: './routine-builder-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoutineBuilderPageComponent {
  readonly store = inject(routineBuilderStore);
  private readonly router = inject(Router);
  private readonly dialogService = inject(DialogService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly searchValue = signal('');

  private readonly _init = this.store.refresh(undefined);

  private isValidRoutineId(value: unknown): value is string {
    return (
      typeof value === 'string' &&
      value.trim().length > 0 &&
      value !== 'true' &&
      value !== 'false'
    );
  }

  onSearch(value: string): void {
    this.searchValue.set(value);
    this.store.searchRoutines(value);
  }

  openCreateDialog(): void {
    this.store.selectRoutine(null);
    this.store.clearSaveResult();
    const ref = this.dialogService.open(RoutineFormDialogComponent, {
      header: 'Nueva Plantilla de Rutina',
      modal: true,
      closable: true,
      dismissableMask: false,
      style: { width: 'min(96vw, 560px)', maxHeight: '90vh' },
      data: { routine: null },
    });

    ref?.onClose.subscribe((newId: string | false) => {
      if (this.isValidRoutineId(newId)) {
        this.messageService.add({
          severity: 'success',
          summary: 'Plantilla creada',
          detail: 'Abriendo editor...',
          life: 2000,
        });
        this.router.navigate(['/dashboard/admin/routine-builder', newId]);
        return;
      }

      if (newId) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error al crear plantilla',
          detail:
            'La plantilla se guardo sin devolver un id valido para abrir el editor.',
          life: 4000,
        });
      }
    });
  }

  openEditMetaDialog(routine: RoutineTemplate): void {
    this.store.selectRoutine(routine);
    this.store.clearSaveResult();
    const ref = this.dialogService.open(RoutineFormDialogComponent, {
      header: 'Editar Metadatos',
      modal: true,
      closable: true,
      dismissableMask: false,
      style: { width: 'min(96vw, 560px)', maxHeight: '90vh' },
      data: { routine },
    });

    ref?.onClose.subscribe((saved: boolean) => {
      if (saved) {
        this.messageService.add({
          severity: 'success',
          summary: 'Actualizado',
          life: 2500,
        });
        this.store.selectRoutine(null);
      }
    });
  }

  openEditor(routine: RoutineTemplate): void {
    this.router.navigate(['/dashboard/admin/routine-builder', routine.id]);
  }

  confirmDelete(routine: RoutineTemplate): void {
    this.confirmationService.confirm({
      message: `Eliminar "<strong>${routine.name}</strong>"? Esta accion no se puede deshacer.`,
      header: 'Eliminar plantilla',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.store.deleteRoutine(routine.id);
        this.messageService.add({
          severity: 'info',
          summary: 'Plantilla eliminada',
          life: 3000,
        });
      },
    });
  }

  duplicateRoutine(routine: RoutineTemplate): void {
    this.store.duplicateRoutine(routine);
    this.messageService.add({
      severity: 'info',
      summary: 'Plantilla duplicada',
      detail: `"${routine.name} (Copia)" fue creada.`,
      life: 3000,
    });
  }

  difficultyLabel(id: string): string {
    return routineLabelById(ROUTINE_DIFFICULTY_CATALOG, id);
  }

  difficultyTag(id: string): 'success' | 'warn' | 'danger' {
    const map: Record<string, 'success' | 'warn' | 'danger'> = {
      beginner: 'success',
      intermediate: 'warn',
      advanced: 'danger',
    };
    return map[id] ?? 'secondary';
  }

  skeletonItems = Array.from({ length: 5 });
}
