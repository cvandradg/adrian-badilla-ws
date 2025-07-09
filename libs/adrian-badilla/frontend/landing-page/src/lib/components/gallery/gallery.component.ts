// gallery.component.ts
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'adrian-badilla-gallery',
  standalone: true,
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class GalleryComponent implements AfterViewInit {
  carousels = [
    {
      images: this.generatePaths('/global/assets/gallery/img-', 10),
      reverse: false,
      ref: 'track1',
    },
    {
      images: this.generatePaths('/global/assets/gallery2/img-', 7),
      reverse: true,
      ref: 'track2',
    },
    {
      images: this.generatePaths('/global/assets/gallery3/img-', 9),
      reverse: false,
      ref: 'track3',
    },
  ];

  @ViewChildren('carouselTrack') trackRefs!: QueryList<ElementRef<HTMLDivElement>>;

  ngAfterViewInit() {
    this.trackRefs.forEach((trackRef) => {
      const track = trackRef.nativeElement;
      const totalWidth = track.scrollWidth / 2;
      const duration = totalWidth / 100;

      track.style.setProperty('--scroll-width', `-${totalWidth}px`);
      track.style.setProperty('--scroll-duration', `${duration}s`);
    });
  }

  private generatePaths(basePath: string, count: number): string[] {
    return Array.from({ length: count }, (_, i) => `${basePath}${i + 1}.jpg`);
  }
}
