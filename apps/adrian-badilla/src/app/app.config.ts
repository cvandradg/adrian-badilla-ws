import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { appRoutes } from './app.routes';
import { environment } from '@adrian-badilla/ui/shared';
import { Auth, provideAuth, getAuth } from '@angular/fire/auth';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideRouter } from '@angular/router';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { FontAwesomeicons } from '@adrian-badilla/ui/shared/assets/icons/fontawesome';
import { connectAuthEmulator } from 'firebase/auth';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),

    provideAppInitializer(() => {
      if (!environment.useEmulators) return;

      const auth = inject(Auth);
      connectAuthEmulator(auth, 'http://127.0.0.1:9099', {
        disableWarnings: true,
      });
    }),

    provideAppInitializer(() => {
      inject(FaIconLibrary).addIcons(...FontAwesomeicons);
    }),
  ],
};
