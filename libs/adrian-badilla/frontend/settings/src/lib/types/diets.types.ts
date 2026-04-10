export type WithId<T> = T & { id: string };

export type SupercenterDoc = {
  name: string;
  route: string;
  province: string;
  estimateLocation: string;
  exactLocation: string;
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
  | 'estimateLocation'
  | 'exactLocation'
  | 'imgPrimeng'
  | 'status'
> & {
  lastModifiedLabel: string | null;
};