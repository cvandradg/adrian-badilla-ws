import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TourAnchorDirective } from '@adrian-badilla/ui/shared';

export interface SectionTab {
  value: string;
  label: string;
  icon: [string, string];
}

@Component({
  selector: 'lib-section-tabs',
  standalone: true,
  imports: [FontAwesomeModule, TourAnchorDirective],
  templateUrl: './section-tabs.component.html',
  styleUrl: './section-tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionTabsComponent {
  readonly tabs = input.required<SectionTab[]>();
  readonly activeTab = input.required<string>();
  readonly tabChange = output<string>();

  /**
   * When true the panels area uses overflow:hidden and zero padding,
   * so the projected content can manage its own internal scroll (e.g. timeline + tracker).
   * Pass `[panelsFillHeight]="activeTab() === 'someTab'"` from the parent.
   */
  readonly panelsFillHeight = input<boolean>(false);

  onTabClick(value: string): void {
    this.tabChange.emit(value);
  }
}
