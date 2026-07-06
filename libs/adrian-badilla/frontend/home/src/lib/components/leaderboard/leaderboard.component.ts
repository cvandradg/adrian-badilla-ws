import { Component, input } from '@angular/core';
import { LeaderboardEntry } from '../../models/home.model';

@Component({
  selector: 'lib-leaderboard',
  standalone: true,
  imports: [],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss',
})
export class LeaderboardComponent {
  topThree = input.required<LeaderboardEntry[]>();
  restList = input.required<LeaderboardEntry[]>();
}
