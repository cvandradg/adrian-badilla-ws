import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { Achievement } from '../../models/home.model';

@Component({
  selector: 'lib-achievements',
  standalone: true,
  imports: [CommonModule, TagModule],
  templateUrl: './achievements.component.html',
  styleUrl: './achievements.component.scss',
})
export class AchievementsComponent {
  achievements = input.required<Achievement[]>();
  streak = input.required<number>();

  unlockedCount = computed(() => this.achievements().filter(a => a.unlocked).length);
  progressPercent = computed(() => (this.unlockedCount() / this.achievements().length) * 100);
}
