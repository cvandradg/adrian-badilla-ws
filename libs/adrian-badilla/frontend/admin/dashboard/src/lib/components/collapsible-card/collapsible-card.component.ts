import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  signal,
} from '@angular/core';

@Component({
  selector: 'admin-collapsible-card',
  standalone: true,
  templateUrl: './collapsible-card.component.html',
  styleUrl: './collapsible-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollapsibleCardComponent {
  readonly title = input.required<string>();
  readonly description = input('');
  readonly initiallyExpanded = input(false);
  readonly expandAllVersion = input(0);
  readonly collapseAllVersion = input(0);

  readonly expanded = signal(false);
  readonly stateLabel = computed(() =>
    this.expanded() ? 'Expandido' : 'Minimizado'
  );
  readonly indicatorIcon = computed(() =>
    this.expanded() ? 'pi pi-chevron-down' : 'pi pi-chevron-right'
  );

  readonly #initialized = signal(false);
  readonly #lastExpandAllVersion = signal(0);
  readonly #lastCollapseAllVersion = signal(0);

  readonly #syncInitialState = effect(() => {
    const initialValue = this.initiallyExpanded();

    if (this.#initialized()) {
      return;
    }

    this.expanded.set(initialValue);
    this.#initialized.set(true);
  });

  readonly #syncExternalCommands = effect(() => {
    if (!this.#initialized()) {
      return;
    }

    const expandVersion = this.expandAllVersion();
    const collapseVersion = this.collapseAllVersion();

    if (expandVersion !== this.#lastExpandAllVersion()) {
      this.expanded.set(true);
      this.#lastExpandAllVersion.set(expandVersion);
    }

    if (collapseVersion !== this.#lastCollapseAllVersion()) {
      this.expanded.set(false);
      this.#lastCollapseAllVersion.set(collapseVersion);
    }
  });

  toggle(): void {
    this.expanded.update((value) => !value);
  }
}
