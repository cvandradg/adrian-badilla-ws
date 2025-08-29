import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'adrian-badilla-reviews',
  standalone: true,
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewsComponent {}

