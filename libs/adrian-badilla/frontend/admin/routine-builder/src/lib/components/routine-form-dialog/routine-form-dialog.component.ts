import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DividerModule } from 'primeng/divider';
import { routineBuilderStore } from '../../store/routine-builder.store';
import type { RoutineTemplate } from '../../models/routine.model';
import {
  ROUTINE_DIFFICULTY_CATALOG,
  ROUTINE_GOAL_CATALOG,
  ROUTINE_LOCATION_CATALOG,
  routineToPrimeOptions,
} from '../../models/routine.model';

@Component({
  selector: 'admin-routine-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    MultiSelectModule,
    AutoCompleteModule,
    InputNumberModule,
    ToggleSwitchModule,
    DividerModule,
  ],
  templateUrl: './routine-form-dialog.component.html',
  styleUrl: './routine-form-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoutineFormDialogComponent {
  readonly store = inject(routineBuilderStore);
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(DynamicDialogRef);
  private readonly dialogConfig = inject(DynamicDialogConfig);

  readonly routine: RoutineTemplate | null =
    this.dialogConfig.data?.routine ?? null;
  readonly isEditMode = this.routine !== null;

  // ── Options ───────────────────────────────────────────────────────────────
  readonly difficultyOptions = routineToPrimeOptions(ROUTINE_DIFFICULTY_CATALOG);
  readonly goalOptions = routineToPrimeOptions(ROUTINE_GOAL_CATALOG);
  readonly locationOptions = routineToPrimeOptions(ROUTINE_LOCATION_CATALOG);

  // ── Form ──────────────────────────────────────────────────────────────────
  readonly form: FormGroup = this.fb.group({
    name:              [this.routine?.name ?? '', [Validators.required, Validators.minLength(3)]],
    description:       [this.routine?.description ?? ''],
    difficulty:        [this.routine?.difficulty ?? 'intermediate', Validators.required],
    daysPerWeek:       [this.routine?.daysPerWeek ?? 3, [Validators.required, Validators.min(1), Validators.max(7)]],
    goals:             [this.routine?.goals ?? []],
    tags:              [this.routine?.tags ?? []],
    trainingLocations: [this.routine?.trainingLocations ?? []],
    isActive:          [this.routine?.isActive ?? true],
    isTemplate:        [this.routine?.isTemplate ?? true],
  });

  // ── Watch saveResult ──────────────────────────────────────────────────────
  private _wasSaving = false;

  private readonly _saveWatcher = effect(() => {
    const isSaving = this.store.saving();
    if (this._wasSaving && !isSaving) {
      const result = this.store.saveResult();
      if (result === true) {
        if (this.isEditMode) {
          this.dialogRef.close(true);
        } else {
          const createdRoutineId = this.store.createdRoutineId();
          if (typeof createdRoutineId === 'string' && createdRoutineId.trim()) {
            this.dialogRef.close(createdRoutineId);
          }
        }
      }
    }
    this._wasSaving = isSaving;
  });

  // ── Tags autocomplete ─────────────────────────────────────────────────────
  readonly tagSuggestions = signal<string[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  noopComplete(): void {}

  // ── Submit ────────────────────────────────────────────────────────────────
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    if (this.isEditMode && this.routine) {
      this.store.updateRoutine({ id: this.routine.id, data: value });
    } else {
      this.store.createRoutine({ ...value, days: [] });
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  isFieldInvalid(name: string): boolean {
    const ctrl = this.form.get(name);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }
}
