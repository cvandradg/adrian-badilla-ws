import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

type Stat = { value: string; label: string };

/**
 * Hero scene: pinned image frame that shrinks while marquee ribbons, the
 * headline and the count-up stat plates reveal. Owns the stat data; the pin /
 * shrink / count-up choreography is driven by the shell's scroll engine through
 * the `data-hero-*` and `data-ab-stats` hooks on this template.
 */
@Component({
  selector: 'ab-hero-section',
  imports: [RouterLink],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSectionComponent {
  protected readonly stats: readonly Stat[] = [
    { value: '30+', label: 'Campeones nacionales formados' },
    { value: '25+', label: 'Años de experiencia' },
    { value: 'Juez', label: 'Federación Nacional de Fisicoculturismo' },
    { value: '5.0★', label: 'Valoración de sus clientes' },
  ];
}
