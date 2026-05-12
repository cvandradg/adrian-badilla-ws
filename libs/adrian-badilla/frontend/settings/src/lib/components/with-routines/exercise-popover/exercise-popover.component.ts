import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'lib-exercise-popover',
  standalone: true,
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
  readonly exerciseName = input.required<string>();
  readonly videoUrl = input<string>('');

  readonly #videoError = signal(false);

  readonly showVideo = computed(() => !!this.videoUrl() && !this.#videoError());

  onVideoError(): void {
    this.#videoError.set(true);
  }
}
