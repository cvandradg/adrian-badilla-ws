import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'adrian-badilla-dashboard-section-placeholder',
  standalone: true,
  templateUrl: './section-placeholder.component.html',
  styleUrl: './section-placeholder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardSectionPlaceholderComponent {
  readonly #route = inject(ActivatedRoute);

  readonly #data = toSignal(this.#route.data, {
    initialValue: this.#route.snapshot.data,
  });

  readonly title = computed(() => this.#data()['title'] ?? 'Sección');
  readonly description = computed(
    () =>
      this.#data()['description'] ??
      'Contenido en preparación dentro del dashboard.',
  );
}
