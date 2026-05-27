import { signalStore, withFeature } from '@ngrx/signals';
import { withFirestoreCrud } from '@adrian-badilla/ui/shared/stores/firestoreStore/utils/with-firestore-crud.feature';
import { withFoodDescription } from './with-food-description.feature';
import { withRoutes } from './with-routes.feature';
import { withMacroTracker } from './with-macro-tracker.feature';
import { withNutritionChat } from './with-nutrition-chat.feature';
import { withDietQueries } from './with-diet-queries.feature';
import { withRoutineQueries } from './with-routine-queries.feature';

export const settingsStoreDev = signalStore(
  { providedIn: 'root' },
  // withDevtools('settingsStore'),
  withFirestoreCrud(),
  withFeature((store) => withFoodDescription(store)),
  withFeature((store) => withRoutes(store)),
  withFeature(() => withMacroTracker()),
  withFeature(() => withNutritionChat()),
  withFeature(() => withDietQueries()),
  withFeature(() => withRoutineQueries())
);
