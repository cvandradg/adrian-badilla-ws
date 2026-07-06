import { Route } from '@angular/router';
import { NewsHomeComponent } from './pages/news-home/news-home.component';

export const newsRoutes: Route[] = [
  {
    path: '',
    component: NewsHomeComponent,
  },
];
