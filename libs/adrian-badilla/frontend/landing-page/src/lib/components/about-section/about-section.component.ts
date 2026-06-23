import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * "Sobre mí" + "Planes" — a single pinned scene the shell's engine cross-fades:
 * the about block fades out on exactly the curve the services/pricing block fades
 * in (so the viewport is never blank between them). Includes the mobile-only
 * cinematic intro (`data-about-cine`) and the three pricing plans. Owns the
 * credentials list; the choreography is engine-driven via the `data-about-*` and
 * `data-services-content` hooks, and the visuals use the global brand styles.
 */
@Component({
  selector: 'ab-about-section',
  templateUrl: './about-section.component.html',
  styleUrl: './about-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutSectionComponent {
  protected readonly credentials: readonly string[] = [
    'Excompetidor de culturismo de alto nivel',
    'Juez principal de la Federación Nacional (CR)',
    '+30 campeones nacionales preparados',
    'Coaching presencial en San José y online',
  ];
}
