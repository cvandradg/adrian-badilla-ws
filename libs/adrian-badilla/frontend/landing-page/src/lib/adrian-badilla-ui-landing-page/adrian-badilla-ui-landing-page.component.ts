import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-adrian-badilla-ui-landing-page',
  imports: [CommonModule],
  templateUrl: './adrian-badilla-ui-landing-page.component.html',
  styleUrl: './adrian-badilla-ui-landing-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdrianBadillaUiLandingPageComponent {}
