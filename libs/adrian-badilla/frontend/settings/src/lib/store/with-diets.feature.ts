import { inject, Type } from '@angular/core';
import { patchState, signalStoreFeature, withMethods } from '@ngrx/signals';
import { Observable } from 'rxjs';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

export type WithId<T> = T & { id: string };
export type SupercenterDoc = {
  name: string;
  route: string;
  province: string;
  estimateLocation: string;
  exactLocation: string;
  createdDate: unknown;
  lastModifiedDate: unknown;
};

type SupercentersDialogsState = {
  _supercenterAddDialogRef: DynamicDialogRef | null;
  _supercenterDeleteDialogRef: DynamicDialogRef | null;
};

export type RoutesCrudParentDeps = {
  _create: <T extends object>(params: {
    collectionPath: string;
    data: T;
  }) => Observable<unknown>;
  _remove: (params: { collectionPath: string; id: string }) => Observable<void>;
  _update: <T extends object>(params: {
    collectionPath: string;
    id: string;
    data: Partial<T>;
  }) => Observable<void>;
};

type SettingsStoreDeps = RoutesCrudParentDeps & {
  supercenters: {
    value: () => WithId<SupercenterDoc>[];
    hasValue: () => boolean;
  };
  openDialogToEditSupercenter: (
    component: Type<unknown>,
    supercenter: WithId<SupercenterDoc>,
  ) => void;
};

export function withDiets(settingsStore: any) {
  const dialog = inject(DialogService);

  return signalStoreFeature(
    withMethods(() => ({
      openDialogToEditRouteSupercenter: (
        component: Type<unknown>,
        supercenterOrId: WithId<SupercenterDoc> | string,
      ) => {
        let supercenter: WithId<SupercenterDoc> | undefined;

        if (typeof supercenterOrId === 'string') {
          supercenter = settingsStore.supercenters
            .value()
            .find((item: WithId<SupercenterDoc>) => item.id === supercenterOrId);
        } else {
          supercenter = supercenterOrId;
        }

        if (!supercenter) {
          return;
        }

        const ref = dialog.open(component, {
          data: { supercenter },
          modal: true,
          dismissableMask: true,
          closeOnEscape: true,
          showHeader: false,
          closable: true,
          width: '50rem',
          height: 'content-fit',
          styleClass: 'add-edit-dialog',
          breakpoints: { '960px': '95vw' },
        });

        patchState(settingsStore, { _supercenterDeleteDialogRef: ref });
      },
    }))
  );
}
