import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { MODULES } from '../../exports';

@Component({
  standalone: true,
  selector: 'adrian-badilla-primary-animated-button',
  templateUrl: './primary-animated-button.component.html',
  styleUrls: ['./primary-animated-button.component.scss'],
  imports: [CommonModule, MODULES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrimaryAnimatedButtonComponent {
  enable = input(false);
  loading = input (false);
  buttonText = input<string>();
  success = input(false);
  submitEvent = output<void>();

  onSubmit() {
    this.submitEvent.emit();
  }
}
