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

type SettingsStoreDeps = DietsCrudParentDeps;

export type EditableDiet = Pick<
  WithDietId<DietDoc>,
  'id' | 'name' | 'route' | 'province' | 'estimateLocation' | 'exactLocation'
>;

export type DietDraft = Omit<EditableDiet, 'id'> & {
  id?: string | null;
};

function buildDietSubmitCommand(
  draft: DietDraft,
): { kind: 'save'; payload: EditableDiet } | { kind: 'create'; payload: Omit<DietDraft, 'id'> } {
  const id = draft.id?.trim();

  if (id) {
    return {
      kind: 'save',
      payload: {
        id,
        name: draft.name,
        route: draft.route,
        province: draft.province,
        estimateLocation: draft.estimateLocation,
        exactLocation: draft.exactLocation,
      },
    };
  }

  return {
    kind: 'create',
    payload: {
      name: draft.name,
      route: draft.route,
      province: draft.province,
      estimateLocation: draft.estimateLocation,
      exactLocation: draft.exactLocation,
    },
  };
}

export function withDiets<T extends SettingsStoreDeps>(settingsStore: T) {
  return signalStoreFeature(
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
