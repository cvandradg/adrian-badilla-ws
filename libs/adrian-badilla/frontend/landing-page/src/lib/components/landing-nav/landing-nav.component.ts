import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'adrian-badilla-landing-nav',
  imports: [RouterLink],
  templateUrl: './landing-nav.component.html',
  styleUrl: './landing-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingNavComponent {}
