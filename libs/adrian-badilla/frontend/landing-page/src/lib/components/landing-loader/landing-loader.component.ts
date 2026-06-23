import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Full-screen intro loader (spinner + logo + shimmer wordmark). It animates via
 * inline `style="animation:ab-…"` referencing the global @keyframes, and the
 * shell's scroll engine fades it out by querying `[data-ab-loader]` from the
 * rendered DOM — so the hook keeps working inside this component.
 */
@Component({
  selector: 'ab-landing-loader',
  templateUrl: './landing-loader.component.html',
  styleUrl: './landing-loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingLoaderComponent {}
