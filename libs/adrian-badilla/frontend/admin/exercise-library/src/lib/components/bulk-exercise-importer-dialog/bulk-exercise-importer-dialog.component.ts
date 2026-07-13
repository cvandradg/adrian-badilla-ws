import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { ExerciseRepository } from '../../repositories/exercise.repository';
import type { ExerciseCreatePayload } from '../../models/exercise.model';
import {
  createExerciseDraftFromName,
  type ExerciseDraft,
} from '../../helpers/exercise-draft.helper';
import {
  BODY_REGION_CATALOG,
  EQUIPMENT_CATALOG,
  EXERCISE_CATEGORY_CATALOG,
  EXERCISE_TAG_CATALOG,
  EXERCISE_TYPE_CATALOG,
  GOAL_CATALOG,
  LEVEL_CATALOG,
  MOVEMENT_PATTERN_CATALOG,
  MOVEMENT_PLANE_CATALOG,
  MUSCLE_CATALOG,
  TRAINING_LOCATION_CATALOG,
  toPrimeOptions,
} from '../../shared/catalogs';

interface ExerciseDraftRow extends ExerciseDraft {
  draftId: string;
  selected: boolean;
}

@Component({
  selector: 'admin-bulk-exercise-importer-dialog',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    MultiSelectModule,
    DividerModule,
    TagModule,
    ProgressSpinnerModule,
    TooltipModule,
  ],
  templateUrl: './bulk-exercise-importer-dialog.component.html',
  styleUrl: './bulk-exercise-importer-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BulkExerciseImporterDialogComponent {
  private readonly dialogRef = inject(DynamicDialogRef);
  private readonly repository = inject(ExerciseRepository);

  readonly importText = signal('');
  readonly drafts = signal<ExerciseDraftRow[]>([]);
  readonly saving = signal(false);
  readonly error = signal('');

  readonly muscleOptions = toPrimeOptions(MUSCLE_CATALOG);
  readonly equipmentOptions = toPrimeOptions(EQUIPMENT_CATALOG);
  readonly locationOptions = toPrimeOptions(TRAINING_LOCATION_CATALOG);
  readonly movementPatternOptions = toPrimeOptions(MOVEMENT_PATTERN_CATALOG);
  readonly movementPlaneOptions = toPrimeOptions(MOVEMENT_PLANE_CATALOG);
  readonly categoryOptions = toPrimeOptions(EXERCISE_CATEGORY_CATALOG);
  readonly typeOptions = toPrimeOptions(EXERCISE_TYPE_CATALOG);
  readonly levelOptions = toPrimeOptions(LEVEL_CATALOG);
  readonly tagOptions = toPrimeOptions(EXERCISE_TAG_CATALOG);
  readonly goalOptions = toPrimeOptions(GOAL_CATALOG);
  readonly bodyRegionOptions = toPrimeOptions(BODY_REGION_CATALOG);

  generateDrafts(): void {
    const names = this.importText()
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);

    const drafts = names.map((name, index) => ({
      ...createExerciseDraftFromName(name),
      draftId: `${Date.now()}-${index}-${name}`,
      selected: true,
    }));

    this.drafts.set(drafts);
    this.error.set('');
  }

  updateDraft(draftId: string, patch: Partial<ExerciseDraftRow>): void {
    this.drafts.update((drafts) =>
      drafts.map((draft) =>
        draft.draftId === draftId ? { ...draft, ...patch } : draft
      )
    );
  }

  removeDraft(draftId: string): void {
    this.drafts.update((drafts) =>
      drafts.filter((draft) => draft.draftId !== draftId)
    );
  }

  selectAll(selected: boolean): void {
    this.drafts.update((drafts) =>
      drafts.map((draft) => ({ ...draft, selected }))
    );
  }

  selectedCount(): number {
    return this.drafts().filter((draft) => draft.selected).length;
  }

  hasCriticalFieldIssues(draft: ExerciseDraftRow): boolean {
    return this.criticalFieldNames(draft).length > 0;
  }

  criticalFieldNames(draft: ExerciseDraftRow): string[] {
    const issues: string[] = [];

    if (draft.primaryMuscles.length === 0) issues.push('Músculos primarios');
    if (draft.secondaryMuscles.length === 0)
      issues.push('Músculos secundarios');
    if (!draft.movementPattern) issues.push('Patrón');
    if (!draft.exerciseCategory) issues.push('Categoría');
    if (!draft.movementPlane) issues.push('Plano');
    if (!draft.bodyRegion) issues.push('Body region');
    if (draft.goals.length === 0) issues.push('Goals');
    if (draft.tags.length === 0) issues.push('Tags');

    return issues;
  }

  isFieldNeedingReview(
    draft: ExerciseDraftRow,
    field:
      | 'primaryMuscles'
      | 'secondaryMuscles'
      | 'movementPattern'
      | 'exerciseCategory'
      | 'movementPlane'
      | 'bodyRegion'
      | 'goals'
      | 'tags'
  ): boolean {
    const value = draft[field];

    if (Array.isArray(value)) {
      return value.length === 0;
    }

    return !value;
  }

  saveSelected(): void {
    const selectedDrafts = this.drafts().filter(
      (draft) => draft.selected && draft.name.trim().length > 0
    );

    if (selectedDrafts.length === 0) {
      this.error.set('Selecciona al menos un draft válido para guardar.');
      return;
    }

    this.saving.set(true);
    this.error.set('');

    forkJoin(
      selectedDrafts.map((draft) =>
        this.repository.create(this.toPayload(draft))
      )
    ).subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogRef.close({ savedCount: selectedDrafts.length });
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.error.set(
          err instanceof Error
            ? err.message
            : 'No se pudieron guardar los drafts.'
        );
      },
    });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  private toPayload(draft: ExerciseDraftRow): ExerciseCreatePayload {
    const { draftId: _draftId, selected: _selected, ...payload } = draft;
    return payload;
  }
}
