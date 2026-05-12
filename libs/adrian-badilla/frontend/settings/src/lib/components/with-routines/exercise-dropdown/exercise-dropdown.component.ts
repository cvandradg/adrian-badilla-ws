import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ViewContainerRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { RoutinesOverlayService } from '../routines-overlay.service';
import { EXERCISE_VIDEOS } from '../exercise-videos.constants';
import { EXERCISE_DESCRIPTIONS } from '../exercise-descriptions.constants';

/**
 * ExerciseDropdownComponent
 *
 * Renders a list of exercises as rows, each with a 👁 icon that opens
 * a floating preview popover via CDK Overlay.
 *
 * Provided in: RoutinesOverlayService (per-instance, isolated overlay lifecycle).
 * Used in: RoutineDecisionComponent dropdown-content slot.
 */
@Component({
  selector: 'lib-exercise-dropdown',
  standalone: true,
  templateUrl: './exercise-dropdown.component.html',
  styleUrl: './exercise-dropdown.component.scss',
  providers: [RoutinesOverlayService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExerciseDropdownComponent {
  readonly exercises = input.required<string[]>();

  readonly #vcr = inject(ViewContainerRef);
  readonly #overlay = inject(RoutinesOverlayService);
  readonly #destroyRef = inject(DestroyRef);

  /** Tracks which exercise has an open popover. */
  readonly activeExercise = signal<string | null>(null);

  constructor() {
    // Dispose overlay when dropdown is destroyed (e.g. card collapses)
    this.#destroyRef.onDestroy(() => this.#overlay.close());
  }

  togglePreview(event: MouseEvent, exerciseName: string): void {
    event.stopPropagation();

    const isSameExercise = this.activeExercise() === exerciseName;

    // Always close current popover
    this.#overlay.close();
    this.activeExercise.set(null);

    if (!isSameExercise) {
      this.activeExercise.set(exerciseName);
      const origin = event.currentTarget as Element;
      const videoUrl = EXERCISE_VIDEOS[exerciseName] ?? '';
      const description = EXERCISE_DESCRIPTIONS[exerciseName] ?? '';

      this.#overlay.open(origin, exerciseName, videoUrl, description, this.#vcr, () => {
        this.activeExercise.set(null);
      });
    }
  }

  isActive(exerciseName: string): boolean {
    return this.activeExercise() === exerciseName;
  }
}
