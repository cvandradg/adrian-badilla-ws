import Aura from '@primeuix/themes/aura';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { appRoutes } from './app.routes';
import { environment } from '@adrian-badilla/ui/shared';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { provideRouter } from '@angular/router';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { FontAwesomeicons } from '@adrian-badilla/ui/shared/assets/icons/fontawesome';
import { providePrimeNG } from 'primeng/config';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { DialogService } from 'primeng/dynamicdialog';
import { provideHttpClient } from '@angular/common/http';
import { firebaseAuthStore } from '@adrian-badilla/auth';
import { billingStore } from '@adrian-badilla/billing';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimationsAsync(),
    provideFirestore(() => getFirestore()),
    provideHttpClient(),
    providePrimeNG({
      ripple: true,
      theme: {
        preset: Aura,
      },
    }),
    DialogService,
    provideRouter(appRoutes),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFunctions(() => getFunctions()),
    provideAppInitializer(() => {
      inject(FaIconLibrary).addIcons(...FontAwesomeicons);
      // Start the global auth-state listener as soon as the app boots.
      // This populates firebaseUser / authInitialized for the entire app.
      inject(firebaseAuthStore).initAuthListener();
      // Start the billing onSnapshot listener. Reacts to auth changes automatically.
      inject(billingStore).initialize();
    }),
  ],
};
