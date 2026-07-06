import { Validators } from '@angular/forms';

export const validations = (...validators: any[]) => [
  '',
  [Validators.required, Validators.min(5), Validators.max(30), ...validators],
];

export type Credentials = {
  user: string;
  pass: string;
};

export type NothingOr<T> = T | null | undefined;
