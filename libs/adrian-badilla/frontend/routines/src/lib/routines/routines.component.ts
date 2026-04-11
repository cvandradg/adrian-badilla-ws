import { ChangeDetectionStrategy, Component } from '@angular/core';

type RoutineMetric = {
  label: string;
  value: string;
  detail: string;
};

type RoutineBlock = {
  title: string;
  focus: string;
  cadence: string;
};

@Component({
  selector: 'lib-routines',
  imports: [],
  templateUrl: './routines.component.html',
  styleUrl: './routines.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoutinesComponent {
  readonly metrics: RoutineMetric[] = [
    {
      label: 'Sesiones activas',
      value: '12',
      detail: 'Rutinas listas para esta semana.',
    },
    {
      label: 'Bloques en progreso',
      value: '03',
      detail: 'Ciclos con seguimiento de carga.',
    },
    {
      label: 'Cumplimiento',
      value: '87%',
      detail: 'Promedio de sesiones completadas.',
    },
  ];

  readonly blocks: RoutineBlock[] = [
    {
      title: 'Fuerza superior',
      focus: 'Empuje, tiron y trabajo de estabilidad escapular.',
      cadence: 'Lunes y jueves',
    },
    {
      title: 'Pierna y potencia',
      focus: 'Sentadilla, bisagra y aceleraciones cortas.',
      cadence: 'Martes',
    },
    {
      title: 'Core + movilidad',
      focus: 'Control lumbo-pelvico y amplitud articular.',
      cadence: 'Viernes',
    },
  ];
}
