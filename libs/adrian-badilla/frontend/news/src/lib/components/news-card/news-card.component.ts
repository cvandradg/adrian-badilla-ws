import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { News } from '../../models/news.model';

@Component({
  selector: 'lib-news-card',
  standalone: true,
  imports: [CardModule, TagModule, DatePipe],
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
