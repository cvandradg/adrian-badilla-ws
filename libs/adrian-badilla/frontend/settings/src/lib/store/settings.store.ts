import { signalStore, withFeature } from '@ngrx/signals';
import { withDiets } from './with-diets.feature';
import { withFirestoreCrud } from '../../../../shared/src/lib/stores/firestoreStore/utils/with-firestore-crud.feature';

export const settingsStoreDev = signalStore(
  {providedIn: 'root'},
  // withDevtools('settingsStore'),
   withFirestoreCrud(),
   withFeature((store) => withDiets(store)),
  // withFeature((store) => withRoutes(store)),
  // withFeature((store) => withProducts(store)),
);
