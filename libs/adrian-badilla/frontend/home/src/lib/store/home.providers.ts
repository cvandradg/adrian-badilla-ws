import { inject, Provider } from '@angular/core';
import { HomeStore } from './home.store';

export function provideHomeStore(): Provider[] {
  return [HomeStore];
}

export function injectHomeStore() {
  return inject(HomeStore);
}
