import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * "Toda tu rutina, en una app" — the supplement-label panel (Optimum-Nutrition
 * "Gold Standard" tub treatment with the bottom red stat band). Styling uses the
 * global brand utilities (`.ab-label*`, `.ab-store`, `.ab-chrome/.ab-foil`); the
 * shell gates rendering with `@if (showApp())` and drives the `data-scrub` reveal.
 */
@Component({
  selector: 'ab-app-section',
  templateUrl: './app-section.component.html',
  styleUrl: './app-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppSectionComponent {}
