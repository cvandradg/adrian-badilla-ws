import {
  patchState,
  signalStoreFeature,
  withMethods,
  withState,
  WritableStateSource,
} from '@ngrx/signals';

export function withCustomCallState<Name extends string>(name: Name) {
  type State = Record<`${Name}Loading`, boolean> &
    Record<`${Name}Success`, boolean> &
    Record<`${Name}Error`, string | null>;

  type Methods = Record<`${Name}SetLoading`, () => void> &
    Record<`${Name}SetSuccess`, () => void> &
    Record<`${Name}SetError`, (error: string | null) => void> &
    Record<`${Name}ResetState`, () => void>;

  const baseState = {
    [`${name}Loading`]: false,
    [`${name}Success`]: false,
    [`${name}Error`]: null as string | null,
  };

  return signalStoreFeature(
    withState(baseState as State),

    withMethods(
      (store): Methods =>
        ({
          [`${name}SetLoading`]: () => {
            patchState(
              store as WritableStateSource<State>,
              {
                [`${name}Loading`]: true,
                [`${name}Success`]: false,
                [`${name}Error`]: null,
              } as Partial<State>
            );
          },

          [`${name}SetSuccess`]: () => {
            patchState(
              store as WritableStateSource<State>,
              {
                [`${name}Loading`]: false,
                [`${name}Success`]: true,
                [`${name}Error`]: null,
              } as Partial<State>
            );
          },

          [`${name}SetError`]: (error: string | null) => {
            patchState(
              store as WritableStateSource<State>,
              {
                [`${name}Loading`]: false,
                [`${name}Success`]: false,
                [`${name}Error`]: error,
              } as Partial<State>
            );
          },

          [`${name}ResetState`]: () => {
            patchState(
              store as WritableStateSource<State>,
              {
                [`${name}Loading`]: false,
                [`${name}Success`]: false,
                [`${name}Error`]: null,
              } as Partial<State>
            );
          },
        } as Methods)
    )
  );
}
