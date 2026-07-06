import { Component, input, computed } from '@angular/core';
import { DailySummary } from '../../models/home.model';

@Component({
  selector: 'lib-daily-summary',
  standalone: true,
  imports: [],
  templateUrl: './daily-summary.component.html',
  styleUrl: './daily-summary.component.scss',
})
export class DailySummaryComponent {
  summary = input.required<DailySummary>();
  remainingCalories = input.required<number>();
  isGoalReached = input.required<boolean>();
  macroPercentages = input.required<{ protein: number; carbs: number; fats: number }>();

  readonly ringCircumference = 2 * Math.PI * 42;

  statusLabel = computed(() => {
    const pct = this.macroPercentages();
    if (pct.protein < 50) return 'Te faltan proteínas';
    if (this.isGoalReached()) return '¡Meta alcanzada!';
    return 'Vas bien';
  });

  caloriePercentage = computed(() =>
    Math.min(Math.round((this.summary().calories / this.summary().goal) * 100), 100)
  );

  ringOffset = computed(() => {
    const pct = this.caloriePercentage();
    return this.ringCircumference - (pct / 100) * this.ringCircumference;
  });

  macroList = computed(() => [
    { label: 'Proteína', value: this.summary().protein, percent: this.macroPercentages().protein, color: '#38bdf8' },
    { label: 'Carbos', value: this.summary().carbs, percent: this.macroPercentages().carbs, color: '#8b5cf6' },
    { label: 'Grasas', value: this.summary().fats, percent: this.macroPercentages().fats, color: '#f59e0b' },
  ]);
}
