import { Type } from '@angular/core';
import {
  signalStoreFeature,
  withFeature,
  withMethods,
} from '@ngrx/signals';
import type { SupercenterDoc as DietDoc, WithId as WithDietId } from '../types/diets.types';
import {
  type DietsCrudParentDeps,
  withDietsCrud,
} from './with-diets-crud.feature';
import {
  withDietsDialogs,
} from './with-diets-dialogs.feature';
import {
  buildDietSubmitCommand,
} from './diets-domain.utils';
import { withCustomCallState } from '../../../../auth/src/lib/data-access/stores/with-custom-call-state.feature';

type SettingsStoreDeps = DietsCrudParentDeps;

export type EditableDiet = Pick<
  WithDietId<DietDoc>,
  'id' | 'name' | 'route' | 'province' | 'estimateLocation' | 'exactLocation'
>;

export type DietDraft = Omit<EditableDiet, 'id'> & {
  id?: string | null;
};

function withDietsCallState<_>() {
  const unusedType: _ | undefined = undefined;
  void unusedType;

  return signalStoreFeature(
    withCustomCallState('createDiet'),
    withCustomCallState('saveDiet'),
    withCustomCallState('removeDiet'),
  );
}

export function withDiets<T extends SettingsStoreDeps>(settingsStore: T) {
  return signalStoreFeature(
    withDietsCallState(),
    withFeature((innerStore) =>
      withDietsCrud(innerStore, settingsStore),
    ),
    withFeature((innerStore) => withDietsDialogs(innerStore)),
    withMethods((innerStore) => ({
      submitDietDraft: (draft: DietDraft) => {
        const command = buildDietSubmitCommand(draft);

        if (command.kind === 'save') {
          innerStore.saveDiet(command.payload);
          return;
        }

        innerStore.createDiet(command.payload);
      },
      openDialogToDeleteEditableDiet: (
        component: Type<unknown>,
        diet: EditableDiet | null | undefined,
      ) => {
        if (!diet?.id) {
          return;
        }
        innerStore.openDialogToDeleteDiet(component, {
          ...diet,
        } as WithDietId<DietDoc>);
      },
    })),
  );
}
