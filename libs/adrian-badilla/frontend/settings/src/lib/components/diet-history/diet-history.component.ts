import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DIET_HISTORY_MOCK } from '../../mock/diet-history.mock';
import { SectionHistoryComponent } from '../section-history/section-history.component';
import type { HistoryEntry } from '../../types/section-history.types';

const DIET_ENTRIES: HistoryEntry[] = DIET_HISTORY_MOCK.map((d) => ({
  id: d.id,
  name: d.dietName,
  startDate: d.startDate,
  endDate: d.endDate,
  status: d.status,
  adherencePercent: d.adherencePercent,
  primaryMetric: `${d.calories.toLocaleString('es-CR')} kcal / día`,
  primaryMetricIcon: 'bolt',
  goal: d.goal,
}));

@Component({
  selector: 'lib-diet-history-settings',
  standalone: true,
  imports: [SectionHistoryComponent],
  template: `
    <lib-section-history
      [entries]="entries"
      title="📋 Historial de Dietas"
      subtitle="Registro completo de tus planes nutricionales"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DietHistorySettingsComponent {
  readonly entries: HistoryEntry[] = DIET_ENTRIES;
}
