import { withFirebaseAuth } from '../stores/with-firebase-auth.feature';
import type {
  SignalStoreFeature,
  SignalStoreFeatureResult,
  WritableStateSource,
} from '@ngrx/signals';

export type FeatureOut<Factory extends (...args: unknown[]) => unknown> =
  ReturnType<Factory> extends SignalStoreFeature<SignalStoreFeatureResult, infer R>
    ? R
    : never;

export type FeatureState<Factory extends (...args: unknown[]) => unknown> =
  FeatureOut<Factory>['state'];

export type FeatureProps<Factory extends (...args: unknown[]) => unknown> =
  FeatureOut<Factory>['props'];

export type FeatureMethods<Factory extends (...args: unknown[]) => unknown> =
  FeatureOut<Factory>['methods'];

export type FirebaseAuthOut = FeatureOut<typeof withFirebaseAuth>;

export type FirebaseAuthDeps = WritableStateSource<FirebaseAuthOut['state']> &
  FirebaseAuthOut['props'] &
  FirebaseAuthOut['methods'];
