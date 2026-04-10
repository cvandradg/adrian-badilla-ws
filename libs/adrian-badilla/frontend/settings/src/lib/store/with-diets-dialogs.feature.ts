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
import type { SupercenterDoc as DietDoc, WithId as WithDietId } from '../types/diets.types';

type DialogRefLike = Pick<DynamicDialogRef, 'close'> & {
  onClose: Observable<unknown>;
  onDestroy: Observable<unknown>;
};

export type DietsDialogsDeps = {
  createDietResetState: () => void;
  saveDietResetState: () => void;
  removeDietResetState: () => void;
};

type DietsDialogsState = {
  _dietAddDialogRef: DynamicDialogRef | null;
  _dietDeleteDialogRef: DynamicDialogRef | null;
};

export function withDietsDialogs<T extends DietsDialogsDeps>(
  dietsStore: T,
) {
  return signalStoreFeature(
    withState<DietsDialogsState>({
      _dietAddDialogRef: null,
      _dietDeleteDialogRef: null,
    }),

    withMethods((innerStore) => {
      const dialog = inject(DialogService);

      return {
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

        closeDeleteDietDialog: () =>
          innerStore._dietDeleteDialogRef()?.close(),
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
              (dietsStore as unknown as DietsDialogsDeps).createDietResetState();
              (dietsStore as unknown as DietsDialogsDeps).saveDietResetState();
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
              (dietsStore as unknown as DietsDialogsDeps).removeDietResetState();
            }),
          ),
      }),
    })),
  );
}
