import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { MODULES } from '../../exports';

@Component({
  selector: 'adrian-badilla-primary-animated-button',
  templateUrl: './primary-animated-button.component.html',
  styleUrls: ['./primary-animated-button.component.scss'],
  imports: [MODULES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrimaryAnimatedButtonComponent {
  enable = input(false);
  loading = input(false);
  buttonText = input<string>();
  success = input(false);
  submitEvent = output<void>();

  onSubmit() {
    this.submitEvent.emit();
  }
}
