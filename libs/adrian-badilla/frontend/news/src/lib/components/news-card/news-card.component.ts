import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { News } from '../../models/news.model';

@Component({
  selector: 'lib-news-card',
  standalone: true,
  imports: [CommonModule, CardModule, TagModule],
  templateUrl: './news-card.component.html',
  styleUrl: './news-card.component.scss',
})
export class NewsCardComponent {
  news = input.required<News>();

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
