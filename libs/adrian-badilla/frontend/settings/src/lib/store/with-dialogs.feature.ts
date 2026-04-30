import {
  withProps,
  withState,
  patchState,
  withMethods,
  signalStoreFeature,
} from '@ngrx/signals';
import { inject, Type } from '@angular/core';
import { merge, Observable, tap } from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import type { SupercenterDoc as DietDoc, WithId as WithDietId, RouteNavItem, RouteSupercenterItem, WithId } from '../types/diets.types';

type DialogRefLike = Pick<DynamicDialogRef, 'close'> & {
  onClose: Observable<unknown>;
  onDestroy: Observable<unknown>;
};

type DialogsState = {
  _dietAddDialogRef: DynamicDialogRef | null;
  _dietDeleteDialogRef: DynamicDialogRef | null;
  _routeDialogRef: DynamicDialogRef | null;
  _supercenterDialogRef: DynamicDialogRef | null;
  _foodDescriptionDialogRef: DynamicDialogRef | null;
};

export function withDialogs<T extends Record<string, any>>(
  storeContext?: T,
) {
  return signalStoreFeature(
    withState<DialogsState>({
      _dietAddDialogRef: null,
      _dietDeleteDialogRef: null,
      _routeDialogRef: null,
      _supercenterDialogRef: null,
      _foodDescriptionDialogRef: null,
    }),

    withMethods((innerStore) => {
      const dialog = inject(DialogService);

      return {
        // ========== DIETAS DIÁLOGOS ==========
        openDialogToAddDiet: (component: Type<unknown>) => {
          const ref = dialog.open(component, {
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

          patchState(innerStore, { _dietAddDialogRef: ref });
        },

        openDialogToEditDiet: (
          component: Type<unknown>,
          diet: WithDietId<DietDoc>,
        ) => {
          const ref = dialog.open(component, {
            data: { diet },
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

          patchState(innerStore, { _dietAddDialogRef: ref });
        },

        openDialogToDeleteDiet: (
          component: Type<unknown>,
          diet: WithDietId<DietDoc>,
        ) => {
          const ref = dialog.open(component, {
            data: { diet },
            modal: true,
            dismissableMask: true,
            closeOnEscape: true,
            showHeader: false,
            closable: true,
            width: '30rem',
            styleClass: 'add-edit-dialog',
            breakpoints: { '960px': '95vw' },
          });

          patchState(innerStore, { _dietDeleteDialogRef: ref });
        },

        closeDietDialog: () => innerStore._dietAddDialogRef()?.close(),
        closeDeleteDietDialog: () => innerStore._dietDeleteDialogRef()?.close(),

        // ========== RUTAS DIÁLOGOS ==========
        openDialogToAddRoute: (component?: Type<unknown>) => {
          if (!component) return;
          const ref = dialog.open(component, {
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

          patchState(innerStore, { _routeDialogRef: ref });
        },

        openDialogToAddSupercenter: (component?: Type<unknown>) => {
          if (!component) return;
          const ref = dialog.open(component, {
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

          patchState(innerStore, { _supercenterDialogRef: ref });
        },

        openDialogToEditRouteDiet: (component: Type<unknown>, item?: RouteSupercenterItem) => {
          if (!component || !item) return;
          const ref = dialog.open(component, {
            data: { item },
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

          patchState(innerStore, { _supercenterDialogRef: ref });
        },

        openDialogToDeleteRoute: (component: Type<unknown>, route?: RouteNavItem) => {
          if (!component || !route) return;
          const ref = dialog.open(component, {
            data: { route },
            modal: true,
            dismissableMask: true,
            closeOnEscape: true,
            showHeader: false,
            closable: true,
            width: '30rem',
            styleClass: 'add-edit-dialog',
            breakpoints: { '960px': '95vw' },
          });

          patchState(innerStore, { _routeDialogRef: ref });
        },

        closeRouteDialog: () => innerStore._routeDialogRef()?.close(),
        closeSupercenterDialog: () => innerStore._supercenterDialogRef()?.close(),

        // ========== DESCRIPCIÓN DE COMIDA DIÁLOGOS ==========
        openDialogFoodDescription: (component?: Type<unknown>, data?: WithId<DietDoc>) => {
          if (!component || !data) return;
          const ref = dialog.open(component, {
            data: { food: data },
            modal: true,
            dismissableMask: true,
            closeOnEscape: true,
            showHeader: false,
            closable: true,
            width: '60rem',
            height: 'content-fit',
            styleClass: 'food-description-dialog',
            breakpoints: { '960px': '95vw' },
          });

          patchState(innerStore, { _foodDescriptionDialogRef: ref });
        },

        closeFoodDescriptionDialog: () => innerStore._foodDescriptionDialogRef()?.close(),
      };
    }),

    withProps((innerStore) => ({
      _dietDialogCloseResource: rxResource({
        params: () => innerStore._dietAddDialogRef() ?? undefined,
        stream: ({ params: ref }) =>
          merge(
            (ref as DialogRefLike).onClose,
            (ref as DialogRefLike).onDestroy,
          ).pipe(
            tap(() => {
              // Only reset state if store context has these methods
              if (storeContext && 'createDietResetState' in storeContext) {
                (storeContext as any).createDietResetState();
                (storeContext as any).saveDietResetState();
              }
            }),
          ),
      }),

      _dietDeleteDialogCloseResource: rxResource({
        params: () => innerStore._dietDeleteDialogRef() ?? undefined,
        stream: ({ params: ref }) =>
          merge(
            (ref as DialogRefLike).onClose,
            (ref as DialogRefLike).onDestroy,
          ).pipe(
            tap(() => {
              if (storeContext && 'removeDietResetState' in storeContext) {
                (storeContext as any).removeDietResetState();
              }
            }),
          ),
      }),

      _routeDialogCloseResource: rxResource({
        params: () => innerStore._routeDialogRef() ?? undefined,
        stream: ({ params: ref }) =>
          merge(
            (ref as DialogRefLike).onClose,
            (ref as DialogRefLike).onDestroy,
          ).pipe(
            tap(() => {
              // Reset route state if needed
            }),
          ),
      }),

      _supercenterDialogCloseResource: rxResource({
        params: () => innerStore._supercenterDialogRef() ?? undefined,
        stream: ({ params: ref }) =>
          merge(
            (ref as DialogRefLike).onClose,
            (ref as DialogRefLike).onDestroy,
          ).pipe(
            tap(() => {
              // Reset supercenter state if needed
            }),
          ),
      }),

      _foodDescriptionDialogCloseResource: rxResource({
        params: () => innerStore._foodDescriptionDialogRef() ?? undefined,
        stream: ({ params: ref }) =>
          merge(
            (ref as DialogRefLike).onClose,
            (ref as DialogRefLike).onDestroy,
          ).pipe(
            tap(() => {
              // Reset food description state if needed
            }),
          ),
      }),
    })),
  );
}
