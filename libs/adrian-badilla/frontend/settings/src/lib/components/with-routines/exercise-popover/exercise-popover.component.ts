import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import type { ExerciseMock } from '../../../mocks/exercises.mock';

@Component({
  selector: 'lib-exercise-popover',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './exercise-popover.component.html',
  styleUrl: './exercise-popover.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('popIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.88) translateY(-8px)' }),
        animate(
          '180ms cubic-bezier(0.25, 0.8, 0.25, 1)',
          style({ opacity: 1, transform: 'scale(1) translateY(0)' }),
        ),
      ]),
    ]),
  ],
})
export class ExercisePopoverComponent {
  readonly exercise = input.required<ExerciseMock>();
  readonly onClose = input.required<() => void>();

  readonly #videoError = signal(false);

  readonly showVideo = computed(() => !!this.exercise().videoUrl && !this.#videoError());

  onVideoError(): void {
    this.#videoError.set(true);
  }

  close(): void {
    this.onClose()();
  }
}
