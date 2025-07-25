import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'adrian-badilla-trainer-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trainer-info.component.html',
  styleUrl: './trainer-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainerInfoComponent {}
