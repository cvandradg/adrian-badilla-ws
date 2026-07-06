import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import type {
  HistoryEntry,
  HistoryEntryStatus,
} from '../../types/section-history.types';

export type HistoryFilter = HistoryEntryStatus | 'todos';

@Component({
  selector: 'lib-section-history',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './section-history.component.html',
  styleUrl: './section-history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHistoryComponent {
  readonly entries = input.required<HistoryEntry[]>();
  readonly title = input<string>('📋 Historial');
  readonly subtitle = input<string>('Registro completo de tus planes');

  readonly activeFilter = signal<HistoryFilter>('todos');

  readonly filtered = computed(() => {
    const filter = this.activeFilter();
    return filter === 'todos'
      ? this.entries()
      : this.entries().filter((e) => e.status === filter);
  });

  readonly filters: Array<{ value: HistoryFilter; label: string }> = [
    { value: 'todos', label: 'Todos' },
    { value: 'en-progreso', label: 'En progreso' },
    { value: 'completado', label: 'Completado' },
    { value: 'cancelado', label: 'Cancelado' },
  ];

  setFilter(value: HistoryFilter): void {
    this.activeFilter.set(value);
  }

  statusLabel(status: HistoryEntryStatus): string {
    const map: Record<HistoryEntryStatus, string> = {
      completado: 'Completado',
      'en-progreso': 'En progreso',
      cancelado: 'Cancelado',
    };
    return map[status];
  }
}
