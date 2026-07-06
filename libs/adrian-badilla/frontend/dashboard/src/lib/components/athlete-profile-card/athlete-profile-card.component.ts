import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { athleteProfileStore } from '../../store/athlete-profile.store';

/**
 * AthleteProfileCardComponent
 *
 * Displays the athlete profile questionnaire status card on the Profile page.
 *
 * ── States ────────────────────────────────────────────────────────────────────
 *  Loading  → skeleton / spinner
 *  Pending  → "Completa tu perfil deportivo" + CTA button
 *  Complete → "✔ Perfil deportivo completado" + last update + edit button
 *
 * Logic-free: all state comes from `athleteProfileStore`.
 * Emits `openForm` event upward — the parent (ProfilePageComponent) triggers
 * `store.openAthleteProfileForm()` so all navigation logic lives in the store.
 */
@Component({
  selector: 'lib-athlete-profile-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './athlete-profile-card.component.html',
  styleUrl: './athlete-profile-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AthleteProfileCardComponent {
  readonly store = inject(athleteProfileStore);

  readonly openForm = output<void>();

  onOpenForm(): void {
    this.openForm.emit();
  }
}
