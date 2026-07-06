import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import type {
  RoutineProgressMetrics,
  PersonalRecord,
} from '../../types/routine-progress.types';
import { ProgressTrackerShellComponent } from '../progress-tracker-shell/progress-tracker-shell.component';

@Component({
  selector: 'lib-routine-progress-tracker',
  standalone: true,
  imports: [ProgressTrackerShellComponent],
  templateUrl: './routine-progress-tracker.component.html',
  styleUrl: './routine-progress-tracker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoutineProgressTrackerComponent {
  /** Computed metrics passed from RoutinesPageComponent. */
  readonly metrics = input.required<RoutineProgressMetrics>();

  // ─── Volume formatting ─────────────────────────────────────────────────────
  readonly formattedVolume = computed<string>(() => {
    const v = this.metrics().totalVolume;
    if (v === 0) return '—';
    if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
    return `${v}`;
  });

  // ─── PR list (truncate to first 3 for display) ─────────────────────────────
  readonly visiblePRs = computed<PersonalRecord[]>(() =>
    this.metrics().newPRs.slice(0, 3)
  );

  readonly extraPRCount = computed<number>(() =>
    Math.max(0, this.metrics().newPRs.length - 3)
  );

  // ─── Progress bar width (clamp 0–100) ──────────────────────────────────────
  readonly barWidth = computed<number>(() =>
    Math.min(100, Math.max(0, this.metrics().completionPercentage))
  );

  // ─── Streak label ──────────────────────────────────────────────────────────
  readonly streakLabel = computed<string>(() => {
    const s = this.metrics().streak;
    if (s === 0) return 'Sin racha';
    if (s === 1) return '1 día';
    return `${s} días`;
  });
}
