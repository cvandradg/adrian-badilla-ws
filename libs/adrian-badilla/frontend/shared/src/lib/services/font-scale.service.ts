import { effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface FontScaleOption {
  value: number;
  label: string;
  description: string;
}

export const FONT_SCALE_OPTIONS: FontScaleOption[] = [
  { value: 0.88, label: 'S', description: 'Pequeño' },
  { value: 1.0, label: 'M', description: 'Normal' },
  { value: 1.12, label: 'L', description: 'Grande' },
  { value: 1.24, label: 'XL', description: 'Muy grande' },
];

const STORAGE_KEY = 'app-font-scale';
const DEFAULT_SCALE = 1.0;
const CSS_PROP = '--app-font-scale';

@Injectable({ providedIn: 'root' })
export class FontScaleService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly scale = signal<number>(this.#readStored());

  /** Sync scale to DOM and localStorage whenever the signal changes — no constructor needed. */
  readonly #syncEffect = effect(() => {
    const v = this.scale();
    if (!this.isBrowser) return;
    document.documentElement.style.setProperty(CSS_PROP, String(v));
    try {
      localStorage.setItem(STORAGE_KEY, String(v));
    } catch {
      /* noop */
    }
  });

  setScale(value: number): void {
    this.scale.set(value);
  }

  #readStored(): number {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return DEFAULT_SCALE;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = parseFloat(raw);
        if (FONT_SCALE_OPTIONS.some((o) => o.value === parsed)) return parsed;
      }
    } catch {
      /* noop */
    }
    return DEFAULT_SCALE;
  }
}
