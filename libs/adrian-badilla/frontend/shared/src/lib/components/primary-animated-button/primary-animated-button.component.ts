import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MODULES } from '../../exports';

@Component({
  standalone: true,
  selector: 'adrian-badilla-primary-animated-button',
  templateUrl: './primary-animated-button.component.html',
  styleUrls: ['./primary-animated-button.component.scss'],
  imports: [CommonModule, MODULES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrimaryAnimatedButtonComponent extends FontAwesomeModule {
  @Input() enable = false;
  @Input() loading = false;
  @Input() buttonText!: string;
  @Output() submitEvent = new EventEmitter<never>();

  onSubmit() {
    this.submitEvent.emit();
  }
}
