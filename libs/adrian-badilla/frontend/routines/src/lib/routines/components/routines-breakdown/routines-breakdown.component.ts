import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TabsModule } from 'primeng/tabs';
import { RoutineMasterDetailComponent } from '../routine-master-detail/routine-master-detail.component';
import type { RoutineDay, RoutineSummary } from '../../types/routine.types';

type BreakdownTab = {
  value: string;
  title: string;
  description: string;
};

@Component({
  selector: 'lib-routines-breakdown',
  imports: [
    FormsModule,
    TabsModule,
    ButtonModule,
    DatePicker,
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
}
