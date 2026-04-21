import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import type { RoutineSummary } from '../../types/routine.types';

@Component({
  selector: 'lib-routines-info-column',
  imports: [FontAwesomeModule],
  templateUrl: './routines-info-column.component.html',
  styleUrl: './routines-info-column.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoutinesInfoColumnComponent {
  readonly summary = input.required<RoutineSummary>();
  readonly currentWeekTitle = input.required<string>();

  readonly routinePurposeItems = [
    {
      title: 'Desarrollar masa muscular',
      description:
        'Estimula el crecimiento muscular con variedad de ejercicios y cargas.',
    },
    {
      title: 'Tonificar y definir',
      description:
        'Mejora la forma y firmeza de gluteos, piernas y tren superior.',
    },
    {
      title: 'Mejorar fuerza funcional',
      description:
        'Aumenta la fuerza en movimientos clave como sentadillas, peso muerto y jalones.',
    },
    {
      title: 'Activar el metabolismo',
      description:
        'El cardio final acelera la quema de grasa y mejora la resistencia cardiovascular.',
    },
    {
      title: 'Control y tecnica',
      description:
        'Las repeticiones lentas y rapidas enseñan al cuerpo a moverse con precision y potencia.',
    },
  ] as const;

  readonly routineBenefits = [
    'Aumento de masa muscular y fuerza.',
    'Mejora de la tecnica y control corporal.',
    'Tonificacion de gluteos, piernas y tren superior.',
    'Activacion metabolica y quema de grasa.',
    'Equilibrio entre fuerza, resistencia y estetica.',
  ] as const;
}
