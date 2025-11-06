import { MODULES } from '../../exports/export-modules';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

@Component({
  standalone: true,
  selector: 'adrian-badilla-secondary-animated-button',
  templateUrl: './secondary-animated-button.component.html',
  styleUrls: ['./secondary-animated-button.component.scss'],
  imports: [MODULES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecondaryAnimatedButtonComponent {
  submitEvent = output<void>();

  small = input(false);
  buttonText = input('Some Text');
  fontawesomeIcon = input<IconProp>(['fas', 'user']);

  onSubmit() {
    this.submitEvent.emit();
  }
}
