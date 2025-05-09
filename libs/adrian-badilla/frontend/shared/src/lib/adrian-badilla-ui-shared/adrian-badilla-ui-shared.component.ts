import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'adrian-badilla-shared',
  imports: [CommonModule],
  templateUrl: './adrian-badilla-ui-shared.component.html',
  styleUrl: './adrian-badilla-ui-shared.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharedComponent {}
