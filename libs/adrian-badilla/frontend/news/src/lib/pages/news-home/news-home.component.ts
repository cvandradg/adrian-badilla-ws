import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsHighlightComponent } from '../../components/news-highlight/news-highlight.component';
import { NewsListComponent } from '../../components/news-list/news-list.component';
import { injectNewsStore, provideNewsStore } from '../../store/news.feature';

@Component({
  selector: 'lib-news-home',
  standalone: true,
  imports: [CommonModule, NewsHighlightComponent, NewsListComponent],
  providers: [...provideNewsStore()],
  templateUrl: './news-home.component.html',
  styleUrl: './news-home.component.scss',
})
export class NewsHomeComponent implements OnInit {
  private readonly store = injectNewsStore();

  featuredNews = this.store.featuredNews;
  latestNews = this.store.latestNews;

  ngOnInit(): void {
    this.store.loadNews();
  }
}
