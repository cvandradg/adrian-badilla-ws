import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'primeng/carousel';
import { TagModule } from 'primeng/tag';
import { News } from '../../models/news.model';

@Component({
  selector: 'lib-news-highlight',
  standalone: true,
  imports: [CommonModule, CarouselModule, TagModule],
  templateUrl: './news-highlight.component.html',
  styleUrl: './news-highlight.component.scss',
})
export class NewsHighlightComponent {
  featured = input.required<News[]>();

  responsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 1,
      numScroll: 1,
    },
  ];

  getCategorySeverity(category: string): 'info' | 'warn' | 'secondary' {
    switch (category) {
      case 'Fitness':
        return 'info';
      case 'Nutrición':
        return 'warn';
      case 'Salud':
        return 'secondary';
      default:
        return 'info';
    }
  }
}
