import { signalStore, withFeature } from '@ngrx/signals';
import { withDiets } from './with-diets.feature';
import { withFirestoreCrud } from '../../../../shared/src/lib/stores/firestoreStore/utils/with-firestore-crud.feature';
import { withFoodDescription } from './with-food-description.feature';
import { withRoutes } from './with-routes.feature';
import { withMacroTracker } from './with-macro-tracker.feature';
import { withNutritionChat } from './with-nutrition-chat.feature';
import { withDietQueries } from './with-diet-queries.feature';

export const settingsStoreDev = signalStore(
  {providedIn: 'root'},
  // withDevtools('settingsStore'),
    withFirestoreCrud(),
    withFeature((store) => withFoodDescription(store)),
    withFeature((store) => withRoutes(store)),
    withFeature(() => withMacroTracker()),
    withFeature(() => withNutritionChat()),
    withFeature((store) => withDiets(store)),
    withFeature(() => withDietQueries()),
);
