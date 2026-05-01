import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaderboardEntry } from '../../models/home.model';

@Component({
  selector: 'lib-leaderboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss',
})
export class LeaderboardComponent {
  topThree = input.required<LeaderboardEntry[]>();
  restList = input.required<LeaderboardEntry[]>();
}
