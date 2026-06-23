import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'adrian-badilla-about-section',
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
