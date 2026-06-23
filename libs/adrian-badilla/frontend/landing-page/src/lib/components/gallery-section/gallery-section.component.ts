import { ChangeDetectionStrategy, Component } from '@angular/core';

type GalleryItem = {
  src: string;
  label: string;
  depth: number;
  vy: number;
  w: string;
  h: string;
  align: 'left' | 'right' | 'center';
};

/**
 * Results gallery: a pinned horizontal scrub scene on desktop, a vertical
 * stacked story on phones. Owns the figure data; the per-figure transforms and
 * the pin math are driven by the shell's scroll engine via the `data-h-*` and
 * `data-depth`/`data-vy`/`data-align` hooks on this template.
 */
@Component({
  selector: 'ab-gallery-section',
  templateUrl: './gallery-section.component.html',
  styleUrl: './gallery-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GallerySectionComponent {
  protected readonly galleryItems: readonly GalleryItem[] = this.buildGallery();

  private buildGallery(): GalleryItem[] {
    const resultados = ['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16']
      .map((n) => `/global/assets/img/resultados/${n}.webp`);
    const gLabels = ['Definición','Fuerza','Escenario','Posing','Disciplina','Volumen','Simetría','Preparación','Constancia','Resultado','Physique','Detalle','Potencia','Forma','Enfoque','Victoria'];
    // [height vh, aspect w/h, vertical offset vh, parallax depth]
    const gRhythm: number[][] = [
      [28, 0.82, -12, 0.04], [38, 1.30, 8, -0.03], [24, 0.80, 18, 0.05],
      [40, 1.12, -3, 0.0], [26, 0.82, 15, 0.04], [32, 1.25, -16, -0.04],
      [24, 0.78, 9, 0.05], [38, 1.10, -8, -0.03], [28, 0.85, 14, 0.04],
      [24, 0.80, -17, 0.06], [40, 1.28, 3, -0.04], [27, 0.82, 17, 0.03],
      [34, 1.15, -12, -0.05], [24, 0.80, 7, 0.05], [28, 0.84, 16, -0.03], [36, 1.20, -6, 0.04],
    ];
    // A shot is "big" when it's tall or wide; everything else is "small".
    const isBig = (i: number) => {
      const [h, ar] = gRhythm[i % gRhythm.length];
      return h >= 36 || ar >= 1.2;
    };
    // Walk the list assigning mobile alignment: consecutive runs of 2+ small
    // shots alternate left/right; lone smalls and all big shots stay centered.
    const N = resultados.length;
    const aligns: Array<'left' | 'right' | 'center'> = new Array(N).fill('center');
    let i = 0;
    while (i < N) {
      if (isBig(i)) { i++; continue; }
      let j = i;
      while (j < N && !isBig(j)) j++;
      if (j - i >= 2) {
        for (let k = i; k < j; k++) aligns[k] = (k - i) % 2 === 0 ? 'left' : 'right';
      }
      i = j;
    }
    return resultados.map((src, idx) => {
      const [h, ar, vy, depth] = gRhythm[idx % gRhythm.length];
      return {
        src,
        label: gLabels[idx % gLabels.length],
        depth,
        vy,
        w: `max(150px, ${(h * ar).toFixed(1)}vh)`,
        h: `${h}vh`,
        align: aligns[idx],
      };
    });
  }
}
