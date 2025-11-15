import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';

type Carousel = { images: string[]; reverse: boolean };

@Component({
  selector: 'adrian-badilla-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryComponent {
  readonly generatePaths = (basePath: string, count: number): string[] =>
    Array.from({ length: count }, (_, i) => `${basePath}${i + 1}.jpg`);

  readonly baseCarousels = signal<Carousel[]>([
    {
      images: this.generatePaths('/global/assets/img/gallery/img-', 10),
      reverse: false,
    },
    {
      images: this.generatePaths('/global/assets/img/gallery2/img-', 7),
      reverse: true,
    },
    {
      images: this.generatePaths('/global/assets/img/gallery3/img-', 9),
      reverse: false,
    },
  ]);

  readonly carousels = computed(() =>
    this.baseCarousels().map((carousel) => {
      const totalWidth = carousel.images.length * 100; // cada img ≈100px
      const duration = totalWidth / 100;
      return {
        ...carousel,
        scrollWidth: `-${totalWidth}px`,
        scrollDuration: `${duration}s`,
      };
    })
  );
}
