import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import Aura from '@primeng/themes/aura';
import { appRoutes } from './app.routes';
import { environment } from '@adrian-badilla/ui/shared';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideRouter } from '@angular/router';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { providePrimeNG } from 'primeng/config';
import { FontAwesomeicons } from '@adrian-badilla/ui/shared/assets/icons/fontawesome';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

const PRIME_NG_ES_TRANSLATION = {
  firstDayOfWeek: 1,
  dayNames: [
    'Domingo',
    'Lunes',
    'Martes',
    'Miercoles',
    'Jueves',
    'Viernes',
    'Sabado',
  ],
  dayNamesShort: ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'],
  dayNamesMin: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  monthNames: [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ],
  monthNamesShort: [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
  ],
  today: 'Hoy',
  clear: 'Limpiar',
  am: 'am.',
  pm: 'pm.',
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideAnimationsAsync(),
    providePrimeNG({
      ripple: true,
      theme: {
        preset: Aura,
      },
      translation: PRIME_NG_ES_TRANSLATION,
    }),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideAppInitializer(() => {
      inject(FaIconLibrary).addIcons(...FontAwesomeicons);
    }),
  ],
};
