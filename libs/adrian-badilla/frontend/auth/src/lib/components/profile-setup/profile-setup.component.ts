import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firebaseAuthStore } from '../../data-access/stores/auth.store';
import type { PhysicalDataPayload } from '../../data-access/models/user-profile.model';

interface PhysicalForm {
  weightKg: number | null;
  heightCm: number | null;
  ageYears: number | null;
  bodyFatPercent: number | null;
}

@Component({
  selector: 'lib-profile-setup',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile-setup.component.html',
  styleUrl: './profile-setup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileSetupComponent {
  readonly #store = inject(firebaseAuthStore);

  readonly saving = this.#store.savingPhysicalData;
  readonly error = this.#store.physicalDataError;
  readonly userName = this.#store.userName;
  readonly userPhoto = this.#store.userPhoto;

  readonly form = signal<PhysicalForm>({
    weightKg: null,
    heightCm: null,
    ageYears: null,
    bodyFatPercent: null,
  });

  /** When true the user has opted out of entering body fat now. */
  readonly skipBodyFat = signal(false);

  readonly isValid = computed(() => {
    const f = this.form();
    return (
      f.weightKg !== null &&
      f.weightKg > 0 &&
      f.heightCm !== null &&
      f.heightCm > 0 &&
      f.ageYears !== null &&
      f.ageYears > 0
      // bodyFatPercent is optional
    );
  });

  toggleSkipBodyFat(): void {
    this.skipBodyFat.update((v) => !v);
    if (this.skipBodyFat()) {
      this.form.update((f) => ({ ...f, bodyFatPercent: null }));
    }
  }

  readonly bmiPreview = computed(() => {
    const f = this.form();
    if (!f.weightKg || !f.heightCm) return null;
    const h = f.heightCm / 100;
    return +(f.weightKg / (h * h)).toFixed(1);
  });

  update(field: keyof PhysicalForm, raw: string): void {
    const val = raw === '' ? null : +raw;
    this.form.update((f) => ({ ...f, [field]: val }));
  }

  submit(): void {
    const uid = this.#store.userId();
    const f = this.form();
    if (!this.isValid() || !uid) return;

    const payload: PhysicalDataPayload = {
      uid,
      weightKg: f.weightKg ?? 0,
      heightCm: f.heightCm ?? 0,
      ageYears: f.ageYears ?? 0,
      bodyFatPercent: this.skipBodyFat() ? null : f.bodyFatPercent ?? null,
    };

    this.#store.savePhysicalData(payload);
  }
}
