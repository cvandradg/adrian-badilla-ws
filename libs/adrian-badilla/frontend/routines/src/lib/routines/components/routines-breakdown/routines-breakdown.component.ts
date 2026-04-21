import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TabsModule } from 'primeng/tabs';
import { RoutineMasterDetailComponent } from '../routine-master-detail/routine-master-detail.component';
import type { RoutineDay, RoutineSummary } from '../../types/routine.types';

type BreakdownTab = {
  value: string;
  title: string;
  description: string;
};

type BreakdownTabValue = 'rutinas' | 'detalle-de-rutinas' | 'rutinas-modificadas';

type RoutineMediaContext = {
  routineName: string;
  blockTitle: string;
};

type RoutineGuideDialogState = RoutineMediaContext & {
  imageSrc: string | null;
};

const EXERCISE_GUIDE_IMAGE_TITLES = new Set([
  'Abductor en maquina sentada',
  'Desplante con mancuerna',
  'Elevacion de pelvis en maquina',
  'Extension de cadera en polea de pie',
  'Extension de codo en polea con barra',
  'Extension de rodilla en maquina',
  'Flexion de codo con barra',
  'Flexion de rodilla acostada',
  'Flexion de rodilla en maquina sentada',
  'Vuelos laterales con mancuerna',
  'Sentadilla Smith',
  'Sentadilla Smith abierta sumo',
  'Remo en polea sentada cerrado',
  'Press de pierna abierta',
  'Prensa profunda',
  'Jalon en polea abierta',
]);

@Component({
  selector: 'lib-routines-breakdown',
  imports: [
    FormsModule,
    TabsModule,
    ButtonModule,
    DatePicker,
    DialogModule,
    FloatLabelModule,
    RoutineMasterDetailComponent,
  ],
  templateUrl: './routines-breakdown.component.html',
  styleUrl: './routines-breakdown.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoutinesBreakdownComponent {
  readonly summary = input.required<RoutineSummary>();
  readonly routineStartDate = input.required<Date>();
  readonly routineEndDate = input.required<Date>();
  readonly maxRoutineDate = input.required<Date>();
  readonly filteredRoutineDays = input.required<readonly RoutineDay[]>();
  readonly searchQuery = input('');

  readonly startDateSelect = output<Date>();
  readonly endDateSelect = output<Date>();
  readonly printRoutines = output<void>();
  readonly searchQueryChange = output<string>();
  readonly activeBreakdownTab = signal<BreakdownTabValue>('rutinas');
  readonly activeMediaContext = signal<RoutineMediaContext | null>(null);
  readonly activeGuideDialog = signal<RoutineGuideDialogState | null>(null);

  readonly breakdownTabs: BreakdownTab[] = [
    {
      value: 'rutinas',
      title: 'Rutinas',
      description: 'Resumen consolidado de rutinas por dia.',
    },
    {
      value: 'detalle-de-rutinas',
      title: 'Imagenes',
      description: 'Guia visual de rutinas con imagenes de apoyo.',
    },
    {
      value: 'rutinas-modificadas',
      title: 'Guia de videos',
      description: 'Videos de rutinas para seguir cada ejercicio paso a paso.',
    },
  ];

  onStartDateSelect(date: Date): void {
    this.startDateSelect.emit(date);
  }

  onEndDateSelect(date: Date): void {
    this.endDateSelect.emit(date);
  }

  onPrintRoutines(): void {
    this.printRoutines.emit();
  }

  onBreakdownTabChange(value: string | number | undefined): void {
    if (typeof value !== 'string') return;
    this.activeBreakdownTab.set(value as BreakdownTabValue);
  }

  onRoutineMediaRequest(request: {
    type: 'image' | 'video';
    routineName: string;
    blockTitle: string;
  }): void {
    this.activeMediaContext.set({
      routineName: request.routineName,
      blockTitle: request.blockTitle,
    });

    if (request.type === 'image') {
      this.activeGuideDialog.set({
        routineName: request.routineName,
        blockTitle: request.blockTitle,
        imageSrc: this.resolveGuideImageSrc(request.blockTitle),
      });
      return;
    }

    this.activeBreakdownTab.set('rutinas-modificadas');
  }

  closeGuideDialog(): void {
    this.activeGuideDialog.set(null);
  }

  private resolveGuideImageSrc(blockTitle: string): string | null {
    if (!EXERCISE_GUIDE_IMAGE_TITLES.has(blockTitle)) return null;

    return `/global/assets/img/guia visual de ejercicios/${encodeURIComponent(blockTitle)}.png`;
  }
}
