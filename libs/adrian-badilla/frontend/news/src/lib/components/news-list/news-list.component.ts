import { Component, input } from '@angular/core';
import { News } from '../../models/news.model';
import { NewsCardComponent } from '../news-card/news-card.component';

@Component({
  selector: 'lib-news-list',
  standalone: true,
  imports: [NewsCardComponent],
  templateUrl: './news-list.component.html',
  styleUrl: './news-list.component.scss',
})
export class NewsListComponent {
  news = input.required<News[]>();
}
