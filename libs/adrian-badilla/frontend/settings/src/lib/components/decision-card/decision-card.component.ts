import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import type { DecisionItem } from '../../types/diet-decision.types';
import { TourAnchorDirective } from '@adrian-badilla/ui/shared';

@Component({
  selector: 'lib-decision-card',
  standalone: true,
  imports: [TourAnchorDirective],
  templateUrl: './decision-card.component.html',
  styleUrl: './decision-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DecisionCardComponent {
  readonly item = input.required<DecisionItem>();
  /** Tour anchor ID for the ✓ accept button. Null = no anchor (non-first items). */
  readonly checkAnchorId = input<string | null>(null);
  /** Tour anchor ID for the card body (click opens dropdown). Null = no anchor. */
  readonly cardBodyAnchorId = input<string | null>(null);
  /** Tour anchor ID for the expanded dropdown content. Null = no anchor. */
  readonly dropdownAnchorId = input<string | null>(null);

  readonly statusChange = output<{
    id: string;
    status: DecisionItem['status'];
  }>();
  readonly openDetails = output<string>();
  readonly openChat = output<string>();

  readonly isDropdownOpen = signal(false);

  toggleDropdown(): void {
    this.isDropdownOpen.update((v) => !v);
  }

  toggleComplete(): void {
    this.emitStatus(
      this.item().status === 'completed' ? 'pending' : 'completed'
    );
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
