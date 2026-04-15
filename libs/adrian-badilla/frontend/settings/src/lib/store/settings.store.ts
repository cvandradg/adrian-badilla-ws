import { signalStore, withFeature } from '@ngrx/signals';
import { withDiets } from './with-diets.feature';
import { withFirestoreCrud } from '../../../../shared/src/lib/stores/firestoreStore/utils/with-firestore-crud.feature';
import { withFoodDescription } from './with-food-description.feature';
import { withDietDecisionEngine } from './with-diet-decision-engine.feature';
import { withRoutes } from './with-routes.feature';
import { withMacroTracker } from './with-macro-tracker.feature';

export const settingsStoreDev = signalStore(
  {providedIn: 'root'},
  // withDevtools('settingsStore'),
    withFirestoreCrud(),
    withFeature(() => withFoodDescription()),
    withFeature(() => withDietDecisionEngine()),
    withFeature(() => withRoutes()),
    withFeature(() => withMacroTracker()),
    withFeature((store) => withDiets(store)),
  // withFeature((store) => withProducts(store)),
);
