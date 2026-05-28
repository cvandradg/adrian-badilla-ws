import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
} from '@angular/core';

type PasswordStrength =
  | 'vulnerable'
  | 'debil'
  | 'semisegura'
  | 'segura'
  | 'fuerte';

// ── Pure helpers (module-scope, no re-allocation per component instance) ────
const SYMBOLS = /[$-/:-?{-~!"^_@`[\]]+/;
const LOWER = /[a-z]+/;
const UPPER = /[A-Z]+/;
const NUMBERS = /[0-9]+/;
const MIN_LENGTH = { test: (p: string) => p.length >= 5 } as RegExp;
const VALIDATORS = [SYMBOLS, LOWER, UPPER, NUMBERS, MIN_LENGTH] as const;

function scorePassword(pass: string): number {
  return VALIDATORS.filter((v) => v.test(pass)).length;
}

function toStrength(score: number): PasswordStrength {
  if (score <= 1) return 'vulnerable';
  if (score <= 2) return 'debil';
  if (score <= 3) return 'semisegura';
  if (score <= 4) return 'segura';
  return 'fuerte';
}

@Component({
  selector: 'adrian-badilla-strength-meter',
  templateUrl: './strength-meter.component.html',
  styleUrls: ['./strength-meter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StrengthMeterComponent {
  readonly password = input('');
  readonly enableButton = output<boolean>();

  /** Fully derived — no mutable state, no lifecycle hooks. */
  readonly result = computed<PasswordStrength>(() =>
    toStrength(scorePassword(this.password()))
  );

  /**
   * The only real side-effect: notify the parent whenever strength changes.
   * `effect()` is correct here because emitting an output IS a side-effect
   * and cannot be expressed as a `computed`.
   */
  readonly #emitEnabled = effect(() => {
    this.enableButton.emit(this.result() !== 'vulnerable');
  });
}
