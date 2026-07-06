import { inject, Provider } from '@angular/core';
import { NewsStore } from './news.store';

export function provideNewsStore(): Provider[] {
  return [NewsStore];
}

export function injectNewsStore() {
  return inject(NewsStore);
}
