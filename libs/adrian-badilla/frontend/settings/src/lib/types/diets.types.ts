export type WithId<T> = T & { id: string };

export type SupercenterDoc = {
  name: string;
  route: string;
  province: string;
  displayFoodName: string;  // Nombre mostrado al usuario (en español)
  foodNameForApi: string;   // Nombre exacto para API (en inglés)
  createdDate: unknown;
  lastModifiedDate: unknown;
  imgPrimeng: string;
  status: 'pending' | 'completed' | 'skipped';
};

export type RouteNavItem = {
  id: string;
  name?: string;
  description?: string;
};

export type RouteSupercenterItem = Pick<
  WithId<SupercenterDoc>,
  | 'id'
  | 'name'
  | 'route'
  | 'province'
  | 'displayFoodName'
  | 'foodNameForApi'
  | 'imgPrimeng'
  | 'status'
> & {
  lastModifiedLabel: string | null;
  baseName?: string;
  selectedFoodName?: string | null;
  selectedFoodNameInEnglish?: string | null;
  selectedFoodDisplayName?: string | null;
  decision?: 'light' | 'balanced' | 'high-protein' | null;
  macros?: {
    protein: number;
    carbs: number;
    fats: number;
  };
};