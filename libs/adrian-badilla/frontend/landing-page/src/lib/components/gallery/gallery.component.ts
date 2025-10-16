import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

type Carousel = { images: string[]; reverse: boolean };

@Component({
  selector: 'adrian-badilla-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryComponent {
  // ---- Generador de rutas (puro y reutilizable) ----
  readonly generatePaths = (basePath: string, count: number): string[] =>
    Array.from({ length: count }, (_, i) => `${basePath}${i + 1}.jpg`);

  // ---- Datos base del carrusel ----
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

  // ---- Cálculo reactivo de propiedades CSS para cada carrusel ----
  readonly carousels = computed(() =>
    this.baseCarousels().map((carousel) => {
      // Simulamos un ancho proporcional al número de imágenes
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
