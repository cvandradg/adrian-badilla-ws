import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'adrian-badilla-landing-loader',
  templateUrl: './landing-loader.component.html',
  styleUrl: './landing-loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingLoaderComponent {}
