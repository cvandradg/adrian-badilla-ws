import { afterNextRender, Component } from '@angular/core';
import { NewsHighlightComponent } from '../../components/news-highlight/news-highlight.component';
import { NewsListComponent } from '../../components/news-list/news-list.component';
import { injectNewsStore, provideNewsStore } from '../../store/news.feature';

@Component({
  selector: 'lib-news-home',
  standalone: true,
  imports: [NewsHighlightComponent, NewsListComponent],
  providers: [...provideNewsStore()],
  templateUrl: './news-home.component.html',
  styleUrl: './news-home.component.scss',
})
export class NewsHomeComponent {
  private readonly store = injectNewsStore();

  readonly featuredNews = this.store.featuredNews;
  readonly latestNews = this.store.latestNews;

  readonly #load = afterNextRender(() => this.store.loadNews());
}
