import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { settingsStoreDev } from '../../../store/settings.store';
import {
  FabLayoutStore,
  FAB_HEIGHT,
  FAB_HEIGHT_MOBILE,
  INTER_FAB_GAP,
} from '../../../store/fab-layout.store';

/**
 * ─── TOUR FAB COMPONENT ───────────────────────────────────────────────────────
 *
 * A small floating action button rendered above the AI Chat FAB in
 * NutritionChatComponent. Visible only during development (or for any user
 * who should be able to re-trigger the tour).
 *
 * In production, the tour will launch automatically via `store.startTour()`
 * based on `TourPersistenceRecord.hasCompleted` — this FAB stays as a
 * "replay tour" affordance accessible from user settings.
 *
 * Intentionally minimal: zero logic, just a store dispatch.
 */
@Component({
  selector: 'lib-tour-fab',
  standalone: true,
  imports: [],
  templateUrl: './tour-fab.component.html',
  styleUrl: './tour-fab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourFabComponent {
  protected readonly store = inject(settingsStoreDev);
  readonly #fabLayout = inject(FabLayoutStore);

  protected readonly startTour = (): void => this.store.startTour();

  /**
   * CSS custom property value for `--fab-bottom-base`.
   * The tour FAB stacks above the chat FAB, so its base offset
   * adds one FAB height + inter-FAB gap to the shared base.
   * SCSS adds `env(safe-area-inset-bottom)` on top.
   */
  readonly tourFabBottomBase = computed(
    () => `${this.#fabLayout.fabBaseBottom() + FAB_HEIGHT + INTER_FAB_GAP}px`
  );

  /** Same calculation for the narrow viewport (≤ 600 px) where FABs are 40 px. */
  readonly tourFabBottomBaseMobile = computed(
    () =>
      `${this.#fabLayout.fabBaseBottom() + FAB_HEIGHT_MOBILE + INTER_FAB_GAP}px`
  );
}
