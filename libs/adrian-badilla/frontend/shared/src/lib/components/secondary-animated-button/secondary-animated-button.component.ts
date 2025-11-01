import { MODULES } from '../../exports/export-modules';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Fontawesome } from '../../assets/icons/fontawesome';

@Component({
  standalone: true,
  selector: 'adrian-badilla-secondary-animated-button',
  templateUrl: './secondary-animated-button.component.html',
  styleUrls: ['./secondary-animated-button.component.scss'],
  imports: [MODULES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecondaryAnimatedButtonComponent extends Fontawesome {
  @Output() submitEvent = new EventEmitter<never>();

  @Input() small = false;
  @Input() buttonText = 'Some Text';
  @Input() fontawesomeIcon: IconProp = ['fas', 'user'];

  onSubmit() {
    this.submitEvent.emit();
  }
}
