import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'adrian-badilla-auth',
  imports: [CommonModule],
  templateUrl: './adrian-badilla-ui-auth.component.html',
  styleUrl: './adrian-badilla-ui-auth.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdrianBadillaUiAuthComponent {}
