// Tipos y utilidades para el dominio de dietas

type EditableDiet = {
  id: string;
  name: string;
  route: string;
  province: string;
  displayFoodName: string;  // Nombre mostrado al usuario
  foodNameForApi: string;   // Nombre exacto para API
};

type DietDraft = Omit<EditableDiet, 'id'> & {
  id?: string | null;
};

export type DietSubmitCommand =
  | {
      kind: 'create';
      payload: Omit<DietDraft, 'id'>;
    }
  | {
      kind: 'save';
      payload: EditableDiet;
    };

function trimDietDraft(
  draft: DietDraft,
): Omit<DietDraft, 'id'> {
  return {
    name: draft.name.trim(),
    route: draft.route.trim(),
    province: draft.province.trim(),
    displayFoodName: draft.displayFoodName.trim(),
    foodNameForApi: draft.foodNameForApi.trim(),
  };
}

export function buildDietSubmitCommand(
  draft: DietDraft,
): DietSubmitCommand {
  const payload = trimDietDraft(draft);
  const id = draft.id?.trim();

  if (id) {
    return {
      kind: 'save',
      payload: {
        id,
        ...payload,
      },
    };
  }

  return {
    kind: 'create',
    payload,
  };
}

export function toDeleteDietDialogData(
  diet: EditableDiet,
): EditableDiet & { createdDate: null; lastModifiedDate: null } {
  return {
    id: diet.id,
    name: diet.name,
    route: diet.route,
    province: diet.province,
    displayFoodName: diet.displayFoodName,
    foodNameForApi: diet.foodNameForApi,
    createdDate: null,
    lastModifiedDate: null,
  };
}
