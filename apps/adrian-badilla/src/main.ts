import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Opt out of the browser's native scroll restoration so a refresh always starts
// at the top (hero) instead of returning to the section the user had scrolled to.
// Set before bootstrap so it takes effect before the page height is restored.
if (typeof history !== 'undefined' && 'scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
