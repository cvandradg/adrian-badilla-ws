import { Component, input } from '@angular/core';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'lib-weekly-progress',
  standalone: true,
  imports: [ChartModule],
  templateUrl: './weekly-progress.component.html',
  styleUrl: './weekly-progress.component.scss',
})
export class WeeklyProgressComponent {
  weeklyProgress = input.required<number[]>();
  goal = input.required<number>();

  get chartData() {
    return {
      labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      datasets: [
        {
          label: 'Calorías',
          data: this.weeklyProgress(),
          borderColor: '#22d3ee',
          backgroundColor: 'rgba(34, 211, 238, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#22d3ee',
          pointBorderColor: '#22d3ee',
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'Meta',
          data: Array(7).fill(this.goal()),
          borderColor: '#334155',
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false,
        },
      ],
    };
  }

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { color: 'rgba(51, 65, 85, 0.5)' },
        ticks: { color: '#94a3b8' },
      },
      y: {
        grid: { color: 'rgba(51, 65, 85, 0.5)' },
        ticks: { color: '#94a3b8' },
      },
    },
  };
}
