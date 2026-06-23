import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Landing footer: brand block, navigation/contact columns, socials and the
 * oversized wordmark. Purely presentational — no scroll-engine hooks — so it is
 * the safest section to own its styles locally (Emulated encapsulation).
 */
@Component({
  selector: 'ab-landing-footer',
  templateUrl: './landing-footer.component.html',
  styleUrl: './landing-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingFooterComponent {}
