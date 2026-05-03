import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import type { DecisionItem } from '../../types/diet-decision.types';

@Component({
  selector: 'lib-decision-card',
  standalone: true,
  imports: [],
  templateUrl: './decision-card.component.html',
  styleUrl: './decision-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DecisionCardComponent {
  readonly item = input.required<DecisionItem>();

  readonly statusChange = output<{ id: string; status: DecisionItem['status'] }>();
  readonly openDetails = output<string>();
  readonly openChat = output<string>();

  readonly isDropdownOpen = signal(false);

  toggleDropdown(): void {
    this.isDropdownOpen.update((v) => !v);
  }

  toggleComplete(): void {
    this.emitStatus(this.item().status === 'completed' ? 'pending' : 'completed');
  }

  toggleSkip(): void {
    this.emitStatus(this.item().status === 'skipped' ? 'pending' : 'skipped');
  }

  onOpenChat(): void {
    this.openChat.emit(this.item().id);
  }

  onOpenDetails(): void {
    this.openDetails.emit(this.item().id);
  }

  private emitStatus(status: DecisionItem['status']): void {
    this.statusChange.emit({ id: this.item().id, status });
  }
}
