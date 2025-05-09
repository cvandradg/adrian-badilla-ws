import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'adrian-badilla-landing-page',
  imports: [CommonModule],
  templateUrl: './adrian-badilla-ui-landing-page.component.html',
  styleUrl: './adrian-badilla-ui-landing-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPageComponent {}
