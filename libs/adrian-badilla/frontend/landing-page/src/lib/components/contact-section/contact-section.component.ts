import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Final call-to-action ("¿Listo para tu mejor versión?"). Styling comes from
 * the global brand utilities (`.ab-carbon`, `.ab-slash`, `.ab-btn-*`); the
 * `data-parallax`/`data-scrub` hooks are driven by the shell's scroll engine,
 * which queries the rendered DOM, so they keep working inside this component.
 */
@Component({
  selector: 'ab-contact-section',
  templateUrl: './contact-section.component.html',
  styleUrl: './contact-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactSectionComponent {}
