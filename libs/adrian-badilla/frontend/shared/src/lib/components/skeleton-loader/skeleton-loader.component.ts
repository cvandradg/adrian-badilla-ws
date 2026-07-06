import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

export type SkeletonVariant = 'page' | 'card' | 'list';

@Component({
  selector: 'lib-skeleton-loader',
  standalone: true,
  imports: [],
  templateUrl: './skeleton-loader.component.html',
  styleUrl: './skeleton-loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonLoaderComponent {
  /** Layout variant: 'page' = sidebar + timeline, 'card' = card grid, 'list' = plain rows */
  readonly variant = input<SkeletonVariant>('page');

  /** Number of repeating rows / blocks to render in 'list' and 'card' variants */
  readonly rows = input<number>(4);

  readonly rowArray = computed(() => Array.from({ length: this.rows() }));
}
