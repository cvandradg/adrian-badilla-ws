import { signalStore, withFeature } from '@ngrx/signals';
import { withExerciseLibrary } from './with-exercise-library.feature';

/**
 * ─── EXERCISE LIBRARY STORE ───────────────────────────────────────────────────
 *
 * Global Signal Store for the admin Exercise Library.
 * Provided at root so the same instance is shared across the admin shell.
 */
export const exerciseLibraryStore = signalStore(
  { providedIn: 'root' },
  withFeature(() => withExerciseLibrary())
);
