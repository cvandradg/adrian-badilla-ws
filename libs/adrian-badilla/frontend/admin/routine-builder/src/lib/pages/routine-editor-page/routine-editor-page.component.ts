import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { TabsModule } from 'primeng/tabs';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { routineBuilderStore } from '../../store/routine-builder.store';
import type { RoutineDay, RoutineExercise } from '../../models/routine.model';
import { defaultDay, defaultExerciseSlot } from '../../models/routine.model';
import {
  ExercisePickerRepository,
  type ExerciseRef,
} from '../../repositories/exercise-picker.repository';

@Component({
  selector: 'admin-routine-editor-page',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    TabsModule,
    SkeletonModule,
    ToastModule,
    TooltipModule,
    DialogModule,
    TagModule,
  ],
  providers: [MessageService],
  templateUrl: './routine-editor-page.component.html',
  styleUrl: './routine-editor-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoutineEditorPageComponent {
  readonly store = inject(routineBuilderStore);
  private readonly pickerRepo = inject(ExercisePickerRepository);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  // â”€â”€ Route param â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  readonly routineId = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((p) => p.get('id') ?? '')),
    { initialValue: '' }
  );

  // â”€â”€ Working copy (local signals) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  readonly days = signal<RoutineDay[]>([]);
  readonly routineName = signal('');
  readonly activeTab = signal(0);
  readonly isDirty = signal(false);

  // â”€â”€ Exercise picker state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  readonly pickerVisible = signal(false);
  readonly pickerSearch = signal('');
  private readonly _pickerTargetDayId = signal('');

  // ── Desktop: selected exercise for properties panel ──────────────────────────
  readonly selectedExId = signal<string | null>(null);
  readonly selectedDayId = signal<string | null>(null);

  readonly selectedExercise = computed(() => {
    const exId = this.selectedExId();
    const dayId = this.selectedDayId();
    if (!exId || !dayId) return null;
    const day = this.days().find((d) => d.dayId === dayId);
    return day?.exercises.find((e) => e.exId === exId) ?? null;
  });

  selectExercise(dayId: string, exId: string): void {
    this.selectedDayId.set(dayId);
    this.selectedExId.set(exId);
  }

  clearSelection(): void {
    this.selectedExId.set(null);
    this.selectedDayId.set(null);
  }

  // â”€â”€ All exercises (live stream from exercise-library collection) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  private readonly _allExercises = toSignal(this.pickerRepo.getAll(), {
    initialValue: [] as ExerciseRef[],
  });

  readonly pickerExercises = computed(() => {
    const term = this.pickerSearch().toLowerCase().trim();
    const all = this._allExercises();
    if (!term) return all;
    return all.filter(
      (e) =>
        e.name.toLowerCase().includes(term) ||
        e.primaryMuscles.some((m) => m.toLowerCase().includes(term))
    );
  });

  private readonly _exerciseMap = computed(() => {
    const m = new Map<string, ExerciseRef>();
    this._allExercises().forEach((e) => m.set(e.id, e));
    return m;
  });

  getExerciseName(exerciseId: string): string {
    return this._exerciseMap().get(exerciseId)?.name ?? '(no encontrado)';
  }

  getExerciseThumbnail(exerciseId: string): string {
    return this._exerciseMap().get(exerciseId)?.thumbnailUrl ?? '';
  }

  getExerciseMuscles(exerciseId: string): string {
    const ex = this._exerciseMap().get(exerciseId);
    return ex?.primaryMuscles.slice(0, 2).join(', ') ?? '';
  }

  // ── Init: load routine into working copy ──────────────────────────────────
  private readonly _initEffect = effect(() => {
    const id = this.routineId();
    if (!id) return;
    const found = this.store.routines().find((r) => r.id === id);
    if (!found) return;
    this.days.set(structuredClone(found.days));
    this.routineName.set(found.name);
    this.isDirty.set(false);
    // Use untracked so that activeTab changes do NOT re-trigger this effect.
    // Without untracked, addDay() → activeTab.set() → effect re-runs → days reset.
    untracked(() => {
      if (this.activeTab() >= found.days.length) {
        this.activeTab.set(0);
      }
    });
  });

  readonly activeRoutine = computed(
    () => this.store.routines().find((r) => r.id === this.routineId()) ?? null
  );

  // â”€â”€ Day operations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  addDay(): void {
    const newDay = defaultDay(this.days().length);
    this.days.update((d) => [...d, newDay]);
    this.activeTab.set(this.days().length - 1);
    this.isDirty.set(true);
  }

  removeDay(dayId: string): void {
    // Clear properties panel if the selected exercise was in this day
    if (this.selectedDayId() === dayId) this.clearSelection();
    this.days.update((d) => {
      const filtered = d.filter((day) => day.dayId !== dayId);
      return filtered.map((day, i) => ({ ...day, order: i }));
    });
    const newLen = this.days().length;
    if (this.activeTab() >= newLen) {
      this.activeTab.set(Math.max(0, newLen - 1));
    }
    this.isDirty.set(true);
  }

  renameDay(dayId: string, name: string): void {
    this.days.update((d) =>
      d.map((day) => (day.dayId === dayId ? { ...day, name } : day))
    );
    this.isDirty.set(true);
  }

  moveDayLeft(index: number): void {
    if (index === 0) return;
    this.days.update((d) => {
      const arr = [...d];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr.map((day, i) => ({ ...day, order: i }));
    });
    this.activeTab.set(index - 1);
    this.isDirty.set(true);
  }

  moveDayRight(index: number): void {
    if (index >= this.days().length - 1) return;
    this.days.update((d) => {
      const arr = [...d];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return arr.map((day, i) => ({ ...day, order: i }));
    });
    this.activeTab.set(index + 1);
    this.isDirty.set(true);
  }

  // â”€â”€ Exercise operations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  openPicker(dayId: string): void {
    this._pickerTargetDayId.set(dayId);
    this.pickerSearch.set('');
    this.pickerVisible.set(true);
  }

  addExercise(exerciseId: string): void {
    const dayId = this._pickerTargetDayId();
    this.days.update((d) =>
      d.map((day) => {
        if (day.dayId !== dayId) return day;
        const slot = defaultExerciseSlot(exerciseId, day.exercises.length);
        return { ...day, exercises: [...day.exercises, slot] };
      })
    );
    this.pickerVisible.set(false);
    this.isDirty.set(true);
  }

  removeExercise(dayId: string, exId: string): void {
    if (this.selectedExId() === exId) this.clearSelection();
    this.days.update((d) =>
      d.map((day) => {
        if (day.dayId !== dayId) return day;
        const updated = day.exercises
          .filter((e) => e.exId !== exId)
          .map((e, i) => ({ ...e, order: i }));
        return { ...day, exercises: updated };
      })
    );
    this.isDirty.set(true);
  }

  moveExerciseUp(dayId: string, exId: string): void {
    this.days.update((d) =>
      d.map((day) => {
        if (day.dayId !== dayId) return day;
        const arr = [...day.exercises];
        const idx = arr.findIndex((e) => e.exId === exId);
        if (idx <= 0) return day;
        [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
        return { ...day, exercises: arr.map((e, i) => ({ ...e, order: i })) };
      })
    );
    this.isDirty.set(true);
  }

  moveExerciseDown(dayId: string, exId: string): void {
    this.days.update((d) =>
      d.map((day) => {
        if (day.dayId !== dayId) return day;
        const arr = [...day.exercises];
        const idx = arr.findIndex((e) => e.exId === exId);
        if (idx >= arr.length - 1) return day;
        [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
        return { ...day, exercises: arr.map((e, i) => ({ ...e, order: i })) };
      })
    );
    this.isDirty.set(true);
  }

  updateExerciseField(
    dayId: string,
    exId: string,
    field: keyof RoutineExercise,
    value: RoutineExercise[keyof RoutineExercise]
  ): void {
    this.days.update((d) =>
      d.map((day) => {
        if (day.dayId !== dayId) return day;
        return {
          ...day,
          exercises: day.exercises.map((ex) =>
            ex.exId === exId ? { ...ex, [field]: value } : ex
          ),
        };
      })
    );
    this.isDirty.set(true);
  }

  // â”€â”€ Save â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  private _wasSaving = false;

  private isValidRoutineId(value: unknown): value is string {
    return (
      typeof value === 'string' &&
      value.trim().length > 0 &&
      value !== 'true' &&
      value !== 'false'
    );
  }

  private readonly _saveWatcher = effect(() => {
    const isSaving = this.store.saving();
    if (this._wasSaving && !isSaving) {
      const result = this.store.saveResult();
      if (result === true) {
        this.isDirty.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Cambios guardados',
          life: 2500,
        });
        this.store.clearSaveResult();
      } else if (result === false) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error al guardar',
          detail: this.store.error() ?? '',
          life: 4000,
        });
      }
    }
    this._wasSaving = isSaving;
  });

  save(): void {
    const id = this.routineId();
    if (!this.isValidRoutineId(id)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error al guardar',
        detail: 'La rutina no tiene un id valido para guardar cambios.',
        life: 4000,
      });
      return;
    }
    this.store.updateRoutine({ id, data: { days: this.days() } });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/admin/routine-builder']);
  }
}
