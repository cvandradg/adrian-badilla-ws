import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import {
  DIET_HISTORY_MOCK,
  type DietHistoryEntry,
  type DietStatus,
} from '../../mocks/diet-history.mock';

@Component({
  selector: 'lib-diet-history-settings',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  templateUrl: './diet-history.component.html',
  styleUrl: './diet-history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DietHistorySettingsComponent {
  readonly entries = signal<DietHistoryEntry[]>(DIET_HISTORY_MOCK);
  readonly activeFilter = signal<DietStatus | 'todos'>('todos');

  readonly filtered = computed(() => {
    const filter = this.activeFilter();
    return filter === 'todos'
      ? this.entries()
      : this.entries().filter((e) => e.status === filter);
  });

  readonly filters: Array<{ value: DietStatus | 'todos'; label: string }> = [
    { value: 'todos', label: 'Todos' },
    { value: 'en-progreso', label: 'En progreso' },
    { value: 'completado', label: 'Completado' },
    { value: 'cancelado', label: 'Cancelado' },
  ];

  setFilter(value: DietStatus | 'todos'): void {
    this.activeFilter.set(value);
  }

  statusLabel(status: DietStatus): string {
    const map: Record<DietStatus, string> = {
      completado: 'Completado',
      'en-progreso': 'En progreso',
      cancelado: 'Cancelado',
    };
    return map[status];
  }
}
