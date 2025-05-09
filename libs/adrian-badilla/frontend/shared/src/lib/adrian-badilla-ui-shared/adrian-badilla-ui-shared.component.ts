import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-adrian-badilla-ui-shared',
  imports: [CommonModule],
  templateUrl: './adrian-badilla-ui-shared.component.html',
  styleUrl: './adrian-badilla-ui-shared.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdrianBadillaUiSharedComponent {}
