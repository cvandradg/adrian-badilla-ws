import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

type Stat = { value: string; label: string };

@Component({
  selector: 'adrian-badilla-hero-section',
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
