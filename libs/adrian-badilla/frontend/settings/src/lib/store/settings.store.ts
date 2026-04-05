import { signalStore } from '@ngrx/signals';

export const settingsStore = signalStore(
  {providedIn: 'root'},
  // withDevtools('settingsStore'),
  // withFirestoreCrud(),
  // withFeature((store) => withSupercenters(store)),
  // withFeature((store) => withRoutes(store)),
  // withFeature((store) => withProducts(store)),
);
