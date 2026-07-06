import { computed } from '@angular/core';
import { signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { patchState } from '@ngrx/signals';
import { News } from '../models/news.model';
import { NEWS_DATA } from '../mock/news.data';

export interface NewsState {
  news: News[];
}

const initialState: NewsState = {
  news: [],
};

export const NewsStore = signalStore(
  withState(initialState),
  withComputed(({ news }) => ({
    featuredNews: computed(() => news().filter((item) => item.featured)),
    latestNews: computed(() =>
      [...news()].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    ),
  })),
  withMethods((store) => ({
    loadNews(): void {
      patchState(store, { news: NEWS_DATA });
    },
  }))
);
