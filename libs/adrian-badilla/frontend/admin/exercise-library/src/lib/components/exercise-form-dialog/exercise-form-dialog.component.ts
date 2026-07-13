import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TabsModule } from 'primeng/tabs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FieldsetModule } from 'primeng/fieldset';
import { exerciseLibraryStore } from '../../store/exercise-library.store';
import type { Exercise } from '../../models/exercise.model';
import {
  LEVEL_CATALOG,
  TRAINING_LOCATION_CATALOG,
  MUSCLE_CATALOG,
  EQUIPMENT_CATALOG,
  BODY_REGION_CATALOG,
  MOVEMENT_PATTERN_CATALOG,
  MOVEMENT_PLANE_CATALOG,
  EXERCISE_CATEGORY_CATALOG,
  EXERCISE_TYPE_CATALOG,
  EXERCISE_TAG_CATALOG,
  GOAL_CATALOG,
  CONTRAINDICATION_SEVERITY_CATALOG,
  toPrimeOptions,
  labelById,
  labelsById,
} from '../../shared/catalogs';

@Component({
  selector: 'admin-exercise-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TabsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    MultiSelectModule,
    AutoCompleteModule,
    ToggleSwitchModule,
    DividerModule,
    TagModule,
    ProgressSpinnerModule,
    FieldsetModule,
  ],
  templateUrl: './exercise-form-dialog.component.html',
  styleUrl: './exercise-form-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExerciseFormDialogComponent {
  readonly store = inject(exerciseLibraryStore);
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(DynamicDialogRef);
  private readonly dialogConfig = inject(DynamicDialogConfig);

  // â”€â”€ Mode â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  readonly exercise: Exercise | null = this.dialogConfig.data?.exercise ?? null;
  readonly isEditMode = this.exercise !== null;
  readonly activeTab = signal(0);

  // â”€â”€ Options (IDs â†’ PrimeNG {label, value}) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  readonly levelOptions = toPrimeOptions(LEVEL_CATALOG);
  readonly locationOptions = toPrimeOptions(TRAINING_LOCATION_CATALOG);
  readonly muscleOptions = toPrimeOptions(MUSCLE_CATALOG);
  readonly equipmentOptions = toPrimeOptions(EQUIPMENT_CATALOG);
  readonly bodyRegionOptions = toPrimeOptions(BODY_REGION_CATALOG);
  readonly movementPatternOptions = toPrimeOptions(MOVEMENT_PATTERN_CATALOG);
  readonly movementPlaneOptions = toPrimeOptions(MOVEMENT_PLANE_CATALOG);
  readonly categoryOptions = toPrimeOptions(EXERCISE_CATEGORY_CATALOG);
  readonly typeOptions = toPrimeOptions(EXERCISE_TYPE_CATALOG);
  readonly tagOptions = toPrimeOptions(EXERCISE_TAG_CATALOG);
  readonly goalOptions = toPrimeOptions(GOAL_CATALOG);
  readonly contraindicationSeverityOptions = toPrimeOptions(
    CONTRAINDICATION_SEVERITY_CATALOG
  );
  readonly alternativeExerciseOptions = computed(() =>
    this.store
      .exercises()
      .filter((exercise) => exercise.id !== this.exercise?.id)
      .map((exercise) => ({ label: exercise.name, value: exercise.id }))
  );

  // â”€â”€ Review helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  readonly categoryLabel = (id: string) =>
    labelById(EXERCISE_CATEGORY_CATALOG, id);
  readonly typeLabel = (id: string) => labelById(EXERCISE_TYPE_CATALOG, id);
  readonly levelLabel = (id: string) => labelById(LEVEL_CATALOG, id);
  readonly movementPlaneLabel = (id: string) =>
    labelById(MOVEMENT_PLANE_CATALOG, id);
  readonly muscleLabels = (ids: string[]) => labelsById(MUSCLE_CATALOG, ids);
  readonly equipmentLabels = (ids: string[]) =>
    labelsById(EQUIPMENT_CATALOG, ids);
  readonly exerciseLabels = (ids: string[]) =>
    this.store
      .exercises()
      .filter((exercise) => ids.includes(exercise.id))
      .map((exercise) => exercise.name)
      .join(', ');
  readonly tagLabels = (ids: string[]) => labelsById(EXERCISE_TAG_CATALOG, ids);

  // â”€â”€ Form (stores canonical IDs) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  readonly form: FormGroup = this.fb.group({
    // â”€â”€ General â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    name: [
      this.exercise?.name ?? '',
      [Validators.required, Validators.minLength(3)],
    ],
    description: [this.exercise?.description ?? ''],
    exerciseCategory: [
      this.exercise?.exerciseCategory ?? '',
      Validators.required,
    ],
    exerciseType: [this.exercise?.exerciseType ?? ''],
    isActive: [this.exercise?.isActive ?? true],
    // â”€â”€ Training â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    bodyRegion: [this.exercise?.bodyRegion ?? ''],
    movementPattern: [this.exercise?.movementPattern ?? ''],
    movementPlane: [this.exercise?.movementPlane ?? ''],
    technicalDifficulty: [this.exercise?.technicalDifficulty ?? 'low'],
    riskLevel: [this.exercise?.riskLevel ?? 'low'],
    fatigueLevel: [this.exercise?.fatigueLevel ?? 'low'],
    isCompound: [this.exercise?.isCompound ?? false],
    isUnilateral: [this.exercise?.isUnilateral ?? false],
    isBodyweight: [this.exercise?.isBodyweight ?? false],
    // â”€â”€ Muscles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    primaryMuscles: [this.exercise?.primaryMuscles ?? []],
    secondaryMuscles: [this.exercise?.secondaryMuscles ?? []],
    stabilizerMuscles: [this.exercise?.stabilizerMuscles ?? []],
    instructions: [this.exercise?.instructions ?? []],
    tips: [this.exercise?.tips ?? []],
    commonMistakes: [this.exercise?.commonMistakes ?? []],
    // â”€â”€ Equipment â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    requiredEquipment: [this.exercise?.requiredEquipment ?? []],
    optionalEquipment: [this.exercise?.optionalEquipment ?? []],
    trainingLocations: [this.exercise?.trainingLocations ?? []],
    // â”€â”€ Media â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    videoUrl: [this.exercise?.videoUrl ?? ''],
    thumbnailUrl: [this.exercise?.thumbnailUrl ?? ''],
    // â”€â”€ Extra â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    alternativeExerciseIds: [this.exercise?.alternativeExerciseIds ?? []],
    goals: [this.exercise?.goals ?? []],
    tags: [this.exercise?.tags ?? []],
    // â”€â”€ Contraindications â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    contraindications: this.fb.array(
      (this.exercise?.contraindications ?? []).map((c) =>
        this.fb.group({
          condition: [c.condition, Validators.required],
          severity: [c.severity, Validators.required],
          reason: [c.reason],
        })
      )
    ),
  });

  get contraindications(): FormArray {
    return this.form.get('contraindications') as FormArray;
  }

  // â”€â”€ Watch saveResult to auto-close â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  private _wasSaving = false;

  private readonly _saveWatcher = effect(() => {
    const isSaving = this.store.saving();
    if (this._wasSaving && !isSaving) {
      const result = this.store.saveResult();
      if (result === true) {
        this.dialogRef.close(true);
      }
    }
    this._wasSaving = isSaving;
  });

  // â”€â”€ Contraindication helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  addContraindication(): void {
    this.contraindications.push(
      this.fb.group({
        condition: ['', Validators.required],
        severity: ['caution', Validators.required],
        reason: [''],
      })
    );
  }

  removeContraindication(index: number): void {
    this.contraindications.removeAt(index);
  }

  // â”€â”€ Submit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    if (this.isEditMode && this.exercise) {
      this.store.updateExercise({ id: this.exercise.id, data: value });
    } else {
      this.store.createExercise(value);
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  isFieldInvalid(name: string): boolean {
    const ctrl = this.form.get(name);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  noopComplete(): void {}
}
