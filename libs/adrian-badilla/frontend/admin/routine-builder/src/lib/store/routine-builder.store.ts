import { signalStore, withFeature } from '@ngrx/signals';
import { withRoutineBuilder } from './with-routine-builder.feature';

/**
 * ─── ROUTINE BUILDER STORE ────────────────────────────────────────────────────
 *
 * Global Signal Store for the admin Routine Builder.
 * Provided at root so the same instance is shared across list and editor.
 */
export const routineBuilderStore = signalStore(
  { providedIn: 'root' },
  withFeature(() => withRoutineBuilder())
);
