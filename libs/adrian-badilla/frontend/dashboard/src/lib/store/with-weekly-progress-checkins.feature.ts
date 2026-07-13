import { computed, inject, isDevMode } from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { firebaseAuthStore } from '@adrian-badilla/auth';
import { prepareProgressImage } from '../helpers/prepare-progress-image.helper';
import { WeeklyProgressRepository } from '../repositories/weekly-progress.repository';
import { WEEKLY_CHECKIN_CONFIG } from '../constants/weekly-checkin.constants';
import type {
  AvailableProgressMonth,
  BodyMeasurements,
  ProgressPhotoMetadata,
  ProgressPhotoType,
  ProgressPhotoUploadStatus,
  WeeklyProgressCheckIn,
} from '../types/weekly-progress.types';
import {
  createDraftCheckIn,
  getCurrentIsoWeekId,
  getNextFriday,
  groupCheckInsByYearMonth,
  hasRequiredProgressPhotos,
  hasValidRequiredMeasurements,
  isCheckInWindowOpen,
  listMeasurementTrends,
  validateProgressImageFile,
} from '../utils/weekly-checkin.utils';

interface WeeklyProgressState {
  currentWeekId: string;
  currentCheckIn: WeeklyProgressCheckIn | null;
  selectedMonthKey: string | null;
  availableMonths: AvailableProgressMonth[];
  monthlyCheckIns: Record<string, WeeklyProgressCheckIn[]>;
  selectedCheckIn: WeeklyProgressCheckIn | null;
  selectedFiles: Partial<Record<ProgressPhotoType, File>>;
  previews: Partial<Record<ProgressPhotoType, string>>;
  uploadProgress: Record<ProgressPhotoType, number>;
  photoStatuses: Record<ProgressPhotoType, ProgressPhotoUploadStatus>;
  photoErrors: Partial<Record<ProgressPhotoType, string>>;
  loadingCurrentWeek: boolean;
  loadingMonths: boolean;
  loadingMoreMonths: boolean;
  hasMoreMonths: boolean;
  loadedMonthKeys: string[];
  loadingMonth: boolean;
  loadingSelectedWeek: boolean;
  saving: boolean;
  deleting: boolean;
  error: string | null;
  consentAccepted: boolean;
  consentLoaded: boolean;
  draftDirty: boolean;
}

const EMPTY_UPLOAD_PROGRESS: Record<ProgressPhotoType, number> = {
  front: 0,
  side: 0,
  back: 0,
};

const EMPTY_PHOTO_STATUS: Record<ProgressPhotoType, ProgressPhotoUploadStatus> = {
  front: 'idle',
  side: 'idle',
  back: 'idle',
};

interface WeeklyProgressCheckInPatch
  extends Omit<
    Partial<WeeklyProgressCheckIn>,
    'measurements' | 'selfAssessment' | 'photos'
  > {
  measurements?: Partial<WeeklyProgressCheckIn['measurements']>;
  selfAssessment?: Partial<WeeklyProgressCheckIn['selfAssessment']>;
  photos?: Partial<WeeklyProgressCheckIn['photos']>;
}

function devLog(message: string, payload?: unknown): void {
  if (!isDevMode()) {
    return;
  }

  console.info(`[weekly-progress-store] ${message}`, payload);
}

function mergeCheckIn(
  current: WeeklyProgressCheckIn,
  partial: WeeklyProgressCheckInPatch
): WeeklyProgressCheckIn {
  return {
    ...current,
    ...partial,
    measurements: {
      ...current.measurements,
      ...(partial.measurements ?? {}),
    },
    selfAssessment: {
      ...current.selfAssessment,
      ...(partial.selfAssessment ?? {}),
    },
    photos: {
      ...current.photos,
      ...(partial.photos ?? {}),
    },
  };
}

function replaceCheckInInMonth(
  items: WeeklyProgressCheckIn[],
  nextItem: WeeklyProgressCheckIn
): WeeklyProgressCheckIn[] {
  const filtered = items.filter((item) => item.weekId !== nextItem.weekId);

  return [...filtered, nextItem].sort((left, right) =>
    right.weekId.localeCompare(left.weekId)
  );
}

function updateMonthList(
  current: AvailableProgressMonth[],
  nextCheckIn: WeeklyProgressCheckIn
): AvailableProgressMonth[] {
  const currentMonth = current.find((month) => month.monthKey === nextCheckIn.monthKey);
  const nextMonth: AvailableProgressMonth = currentMonth
    ? {
        ...currentMonth,
        checkInCount: Math.max(currentMonth.checkInCount, 1),
        latestWeekId: nextCheckIn.weekId,
      }
    : {
        monthKey: nextCheckIn.monthKey,
        year: nextCheckIn.year,
        month: nextCheckIn.month,
        label: new Intl.DateTimeFormat('es-GT', {
          month: 'long',
          year: 'numeric',
        }).format(new Date(nextCheckIn.year, nextCheckIn.month - 1, 1)),
        checkInCount: 1,
        latestWeekId: nextCheckIn.weekId,
      };

  return [...current.filter((month) => month.monthKey !== nextCheckIn.monthKey), nextMonth]
    .sort((left, right) => right.monthKey.localeCompare(left.monthKey));
}

function hasStoredPhoto(
  checkIn: WeeklyProgressCheckIn | null,
  type: ProgressPhotoType
): boolean {
  return Boolean(checkIn?.photos[type]?.storagePath);
}

function buildSaveDisabledReason(state: {
  checkIn: WeeklyProgressCheckIn | null;
  consentAccepted: boolean;
  selectedFiles: Partial<Record<ProgressPhotoType, File>>;
  photoStatuses: Record<ProgressPhotoType, ProgressPhotoUploadStatus>;
  saving: boolean;
}): string | null {
  if (!state.checkIn) {
    return 'No hay un check-in listo para guardar.';
  }

  if (state.saving) {
    return 'Hay una carga en progreso.';
  }

  if (
    !state.consentAccepted &&
    hasRequiredProgressPhotos({
      ...state.checkIn.photos,
      ...state.selectedFiles,
    })
  ) {
    return 'Debes aceptar el consentimiento de fotografias.';
  }

  if (!hasValidRequiredMeasurements(state.checkIn.measurements)) {
    return 'Ingresa un peso valido para completar el check-in.';
  }

  if (
    !hasRequiredProgressPhotos({
      ...state.checkIn.photos,
      ...state.selectedFiles,
    })
  ) {
    return 'Debes completar las tres fotografias requeridas.';
  }

  const failedType = (
    Object.keys(state.photoStatuses) as ProgressPhotoType[]
  ).find((type) => state.photoStatuses[type] === 'failed');

  if (failedType) {
    return `La foto ${failedType} fallo. Reintenta esa carga antes de guardar.`;
  }

  const pendingType = (
    Object.keys(state.photoStatuses) as ProgressPhotoType[]
  ).find((type) =>
    ['preparing', 'uploading'].includes(state.photoStatuses[type])
  );

  if (pendingType) {
    return `La foto ${pendingType} todavia se esta procesando.`;
  }

  return null;
}

function createLocalCurrentWeekDraft(uid: string): WeeklyProgressCheckIn {
  return createDraftCheckIn({
    uid,
    referenceDate: getNextFriday(),
  });
}

export function withWeeklyProgressCheckInsFeature() {
  return signalStoreFeature(
    withProps(() => ({
      _weeklyProgressRepo: inject(WeeklyProgressRepository),
      _authStore: inject(firebaseAuthStore),
    })),
    withState<WeeklyProgressState>({
      currentWeekId: getCurrentIsoWeekId(),
      currentCheckIn: null,
      selectedMonthKey: null,
      availableMonths: [],
      monthlyCheckIns: {},
      selectedCheckIn: null,
      selectedFiles: {},
      previews: {},
      uploadProgress: EMPTY_UPLOAD_PROGRESS,
      photoStatuses: EMPTY_PHOTO_STATUS,
      photoErrors: {},
      loadingCurrentWeek: false,
      loadingMonths: false,
      loadingMoreMonths: false,
      hasMoreMonths: false,
      loadedMonthKeys: [],
      loadingMonth: false,
      loadingSelectedWeek: false,
      saving: false,
      deleting: false,
      error: null,
      consentAccepted: false,
      consentLoaded: false,
      draftDirty: false,
    }),
    withComputed((store) => ({
      isFriday: computed(() => new Date().getDay() === 5),
      nextFriday: computed(() => getNextFriday()),
      hasSubmittedThisWeek: computed(
        () => store.currentCheckIn()?.status === 'complete'
      ),
      canSubmitThisWeek: computed(() => isCheckInWindowOpen()),
      requiredPhotosComplete: computed(() =>
        hasRequiredProgressPhotos({
          ...store.currentCheckIn()?.photos,
          ...store.selectedFiles(),
        })
      ),
      currentWeekStatus: computed(
        () => store.currentCheckIn()?.status ?? 'draft'
      ),
      groupedCheckInsByMonth: computed(() =>
        groupCheckInsByYearMonth(
          Object.values(store.monthlyCheckIns()).flat(),
          store.availableMonths()
        )
      ),
      selectedWeekPhotos: computed(
        () => store.selectedCheckIn()?.photos ?? store.currentCheckIn()?.photos ?? {}
      ),
      formValid: computed(
        () =>
          buildSaveDisabledReason({
            checkIn: store.currentCheckIn(),
            consentAccepted: store.consentAccepted(),
            selectedFiles: store.selectedFiles(),
            photoStatuses: store.photoStatuses(),
            saving: store.saving(),
          }) == null
      ),
      saveDisabledReason: computed(() =>
        buildSaveDisabledReason({
          checkIn: store.currentCheckIn(),
          consentAccepted: store.consentAccepted(),
          selectedFiles: store.selectedFiles(),
          photoStatuses: store.photoStatuses(),
          saving: store.saving(),
        })
      ),
      overallUploadProgress: computed(() => {
        const values = Object.values(store.uploadProgress());
        return Math.round(
          values.reduce((total, value) => total + value, 0) / values.length
        );
      }),
      latestCheckIn: computed(() =>
        Object.values(store.monthlyCheckIns()).flat().sort((left, right) =>
          right.weekId.localeCompare(left.weekId)
        )[0] ?? store.currentCheckIn()
      ),
      previousCheckIn: computed(() => {
        const all = Object.values(store.monthlyCheckIns())
          .flat()
          .sort((left, right) => right.weekId.localeCompare(left.weekId));

        return all[1] ?? null;
      }),
      weeklyMeasurementTrend: computed(() => {
        const all = Object.values(store.monthlyCheckIns())
          .flat()
          .sort((left, right) => right.weekId.localeCompare(left.weekId));

        return listMeasurementTrends(
          store.currentCheckIn() ?? store.selectedCheckIn(),
          all[1] ?? null
        );
      }),
      hasUnsavedChanges: computed(
        () =>
          store.draftDirty() ||
          Object.keys(store.selectedFiles()).length > 0 ||
          Object.keys(store.previews()).length > 0
      ),
    })),
    withMethods((store) => {
      const markPhotoStatus = (
        type: ProgressPhotoType,
        status: ProgressPhotoUploadStatus,
        input: {
          progress?: number;
          error?: string | null;
        } = {}
      ): void => {
        const nextErrors = { ...store.photoErrors() };

        if (input.error) {
          nextErrors[type] = input.error;
        } else {
          delete nextErrors[type];
        }

        patchState(store, {
          photoStatuses: {
            ...store.photoStatuses(),
            [type]: status,
          },
          uploadProgress: {
            ...store.uploadProgress(),
            [type]:
              input.progress ??
              (status === 'uploaded'
                ? 100
                : status === 'failed'
                  ? 0
                  : store.uploadProgress()[type]),
          },
          photoErrors: nextErrors,
        });
      };

      const releasePreview = (type: ProgressPhotoType): void => {
        const preview = store.previews()[type];
        if (preview) {
          URL.revokeObjectURL(preview);
        }
      };

      const resetTransientPhotoState = (): void => {
        patchState(store, {
          selectedFiles: {},
          previews: {},
          uploadProgress: { ...EMPTY_UPLOAD_PROGRESS },
          photoStatuses: { ...EMPTY_PHOTO_STATUS },
          photoErrors: {},
          draftDirty: false,
        });
      };

      const runSaveWeeklyCheckIn = async (): Promise<void> => {
        const uid = store._authStore.userId();
        const currentCheckIn = store.currentCheckIn();

        if (!uid || !currentCheckIn || store.saving()) {
          return;
        }

        const saveDisabledReason = store.saveDisabledReason();
        if (saveDisabledReason) {
          patchState(store, {
            error: saveDisabledReason,
          });
          return;
        }

        patchState(store, {
          saving: true,
          error: null,
          currentCheckIn: {
            ...currentCheckIn,
            status: 'uploading',
          },
        });

        const selectedFiles = { ...store.selectedFiles() };
        const replacementPhotos: Partial<Record<ProgressPhotoType, ProgressPhotoMetadata>> =
          {};
        const previousPhotosToDelete: ProgressPhotoMetadata[] = [];
        const uploadedArtifacts: ProgressPhotoMetadata[] = [];
        const failedTypes: ProgressPhotoType[] = [];
        let nextCheckIn = currentCheckIn;

        try {
          if (store.consentAccepted()) {
            await store._weeklyProgressRepo.saveProgressPhotoConsent(
              uid,
              WEEKLY_CHECKIN_CONFIG.consentVersion
            );
          }

          for (const type of Object.keys(selectedFiles) as ProgressPhotoType[]) {
            const file = selectedFiles[type];

            if (!file) {
              continue;
            }

            try {
              markPhotoStatus(type, 'preparing', {
                progress: 15,
              });
              const prepared = await prepareProgressImage(file);
              markPhotoStatus(type, 'uploading', {
                progress: 55,
              });
              const uploadedPhoto =
                await store._weeklyProgressRepo.uploadProgressPhoto(
                  uid,
                  currentCheckIn.weekId,
                  type,
                  prepared
                );

              replacementPhotos[type] = uploadedPhoto;
              uploadedArtifacts.push(uploadedPhoto);

              if (hasStoredPhoto(currentCheckIn, type)) {
                previousPhotosToDelete.push(currentCheckIn.photos[type]!);
              }

              nextCheckIn = mergeCheckIn(nextCheckIn, {
                photos: {
                  [type]: uploadedPhoto,
                },
              });
              markPhotoStatus(type, 'uploaded');
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : `No fue posible subir la foto ${type}.`;
              failedTypes.push(type);
              markPhotoStatus(type, 'failed', {
                error: message,
              });
            }
          }

          const status: WeeklyProgressCheckIn['status'] =
            failedTypes.length === 0 &&
            hasValidRequiredMeasurements(nextCheckIn.measurements) &&
            hasRequiredProgressPhotos(nextCheckIn.photos) &&
            (store.consentAccepted() || !!nextCheckIn.consentVersion)
              ? 'complete'
              : failedTypes.length > 0
                ? 'failed'
                : 'draft';

          const checkInToSave: WeeklyProgressCheckIn = {
            ...nextCheckIn,
            status,
            consentVersion: store.consentAccepted()
              ? WEEKLY_CHECKIN_CONFIG.consentVersion
              : nextCheckIn.consentVersion,
          };

          await store._weeklyProgressRepo.saveCheckIn(uid, checkInToSave);

          for (const previousPhoto of previousPhotosToDelete) {
            await store._weeklyProgressRepo.deleteUploadedPhotoArtifacts(previousPhoto);
          }

          for (const type of Object.keys(replacementPhotos) as ProgressPhotoType[]) {
            releasePreview(type);
          }

          const remainingSelectedFiles = { ...store.selectedFiles() };
          const remainingPreviews = { ...store.previews() };

          for (const type of Object.keys(replacementPhotos) as ProgressPhotoType[]) {
            delete remainingSelectedFiles[type];
            delete remainingPreviews[type];
          }

          patchState(store, {
            currentCheckIn: checkInToSave,
            selectedCheckIn:
              store.selectedCheckIn()?.weekId === checkInToSave.weekId
                ? checkInToSave
                : store.selectedCheckIn(),
            monthlyCheckIns: {
              ...store.monthlyCheckIns(),
              [checkInToSave.monthKey]: replaceCheckInInMonth(
                store.monthlyCheckIns()[checkInToSave.monthKey] ?? [],
                checkInToSave
              ),
            },
            availableMonths: updateMonthList(
              store.availableMonths(),
              checkInToSave
            ),
            loadedMonthKeys: Array.from(
              new Set([...store.loadedMonthKeys(), checkInToSave.monthKey])
            ),
            saving: false,
            selectedFiles: remainingSelectedFiles,
            previews: remainingPreviews,
            draftDirty: failedTypes.length > 0,
            error:
              failedTypes.length > 0
                ? `Algunas fotos fallaron: ${failedTypes.join(', ')}. Puedes reintentar solo esas cargas.`
                : null,
          });

          devLog('save weekly check-in', {
            uid,
            weekId: checkInToSave.weekId,
            status,
            failedTypes,
          });
        } catch (error) {
          for (const uploadedPhoto of uploadedArtifacts) {
            await store._weeklyProgressRepo.deleteUploadedPhotoArtifacts(
              uploadedPhoto
            );
          }

          patchState(store, {
            saving: false,
            currentCheckIn: currentCheckIn
              ? {
                  ...currentCheckIn,
                  status: 'failed',
                }
              : null,
            error:
              error instanceof Error
                ? error.message
                : 'No fue posible guardar el check-in semanal.',
          });
        } finally {
          patchState(store, {
            saving: false,
          });
        }
      };

      return {
        async loadCurrentWeek(): Promise<void> {
          const uid = store._authStore.userId();

          if (!uid) {
            return;
          }

          const currentWeekId = getCurrentIsoWeekId();
          patchState(store, {
            currentWeekId,
            loadingCurrentWeek: true,
            error: null,
          });

          try {
            const [checkIn, consent] = await Promise.all([
              store._weeklyProgressRepo.getCurrentWeekCheckIn(uid, currentWeekId),
              store._weeklyProgressRepo.getProgressPhotoConsent(uid),
            ]);

            patchState(store, {
              currentCheckIn: checkIn ?? createDraftCheckIn({ uid }),
              loadingCurrentWeek: false,
              consentAccepted:
                consent?.consented ?? Boolean(checkIn?.consentVersion),
              consentLoaded: true,
              photoStatuses: { ...EMPTY_PHOTO_STATUS },
              photoErrors: {},
            });
          } catch (error) {
            patchState(store, {
              loadingCurrentWeek: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'No fue posible cargar el check-in actual.',
            });
          }
        },

        ensureCurrentWeekDraft(): void {
          const uid = store._authStore.userId();
          const currentWeekId = getCurrentIsoWeekId();
          const currentCheckIn = store.currentCheckIn();

          if (!uid) {
            return;
          }

          if (currentCheckIn?.weekId === currentWeekId) {
            return;
          }

          patchState(store, {
            currentWeekId,
            currentCheckIn: createLocalCurrentWeekDraft(uid),
            photoStatuses: { ...EMPTY_PHOTO_STATUS },
            photoErrors: {},
          });
        },

        async loadInitialMonths(): Promise<void> {
          const uid = store._authStore.userId();

          if (!uid) {
            return;
          }

          patchState(store, {
            loadingMonths: true,
            error: null,
          });

          try {
            const page = await store._weeklyProgressRepo.getAvailableMonthsPage(uid, {
              limitMonths: 3,
            });

            patchState(store, {
              availableMonths: page.months,
              hasMoreMonths: page.hasMore,
              loadedMonthKeys: page.months.map((month) => month.monthKey),
              selectedMonthKey:
                store.selectedMonthKey() ?? page.months[0]?.monthKey ?? null,
              loadingMonths: false,
            });
          } catch (error) {
            patchState(store, {
              loadingMonths: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'No fue posible cargar los meses disponibles.',
            });
          }
        },

        async loadAvailableMonths(): Promise<void> {
          await this.loadInitialMonths();
        },

        async loadMoreMonths(): Promise<void> {
          const uid = store._authStore.userId();

          if (!uid || store.loadingMoreMonths() || !store.hasMoreMonths()) {
            return;
          }

          patchState(store, {
            loadingMoreMonths: true,
            error: null,
          });

          try {
            const page = await store._weeklyProgressRepo.getAvailableMonthsPage(uid, {
              loadedMonthKeys: store.loadedMonthKeys(),
              limitMonths: 3,
            });

            patchState(store, {
              availableMonths: [...store.availableMonths(), ...page.months].sort(
                (left, right) => right.monthKey.localeCompare(left.monthKey)
              ),
              hasMoreMonths: page.hasMore,
              loadedMonthKeys: Array.from(
                new Set([
                  ...store.loadedMonthKeys(),
                  ...page.months.map((month) => month.monthKey),
                ])
              ),
              loadingMoreMonths: false,
            });
          } catch (error) {
            patchState(store, {
              loadingMoreMonths: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'No fue posible cargar mas meses.',
            });
          }
        },

        selectMonth(monthKey: string): void {
          patchState(store, {
            selectedMonthKey: monthKey,
          });
        },

        async loadMonthCheckIns(monthKey: string): Promise<void> {
          const uid = store._authStore.userId();

          if (!uid) {
            return;
          }

          if (store.monthlyCheckIns()[monthKey]) {
            patchState(store, {
              selectedMonthKey: monthKey,
            });
            return;
          }

          patchState(store, {
            loadingMonth: true,
            selectedMonthKey: monthKey,
            error: null,
          });

          try {
            const checkIns = await store._weeklyProgressRepo.getCheckInsByMonth(
              uid,
              monthKey
            );
            patchState(store, {
              monthlyCheckIns: {
                ...store.monthlyCheckIns(),
                [monthKey]: checkIns,
              },
              loadingMonth: false,
            });
          } catch (error) {
            patchState(store, {
              loadingMonth: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'No fue posible cargar las semanas del mes.',
            });
          }
        },

        async selectWeek(weekId: string): Promise<void> {
          const uid = store._authStore.userId();

          if (!uid) {
            return;
          }

          patchState(store, {
            loadingSelectedWeek: true,
            error: null,
          });

          try {
            const checkIn = await store._weeklyProgressRepo.getCheckInByWeek(
              uid,
              weekId
            );
            patchState(store, {
              selectedCheckIn: checkIn,
              loadingSelectedWeek: false,
            });
          } catch (error) {
            patchState(store, {
              loadingSelectedWeek: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'No fue posible cargar la semana seleccionada.',
            });
          }
        },

        clearSelectedWeek(): void {
          patchState(store, {
            selectedCheckIn: null,
          });
        },

        updateMeasurements(partial: Partial<BodyMeasurements>): void {
          const currentCheckIn = store.currentCheckIn();

          if (!currentCheckIn) {
            return;
          }

          patchState(store, {
            currentCheckIn: mergeCheckIn(currentCheckIn, {
              measurements: partial,
            }),
            draftDirty: true,
          });
        },

        updateSelfAssessment(
          partial: Partial<WeeklyProgressCheckIn['selfAssessment']>
        ): void {
          const currentCheckIn = store.currentCheckIn();

          if (!currentCheckIn) {
            return;
          }

          patchState(store, {
            currentCheckIn: mergeCheckIn(currentCheckIn, {
              selfAssessment: partial,
            }),
            draftDirty: true,
          });
        },

        updateNotes(notes: string): void {
          const currentCheckIn = store.currentCheckIn();

          if (!currentCheckIn) {
            return;
          }

          patchState(store, {
            currentCheckIn: {
              ...currentCheckIn,
              notes,
            },
            draftDirty: true,
          });
        },

        async selectPhoto(type: ProgressPhotoType, file: File): Promise<void> {
          const validation = validateProgressImageFile(file);

          if (!validation.valid) {
            markPhotoStatus(type, 'failed', {
              error: validation.error,
            });
            patchState(store, {
              error: validation.error,
            });
            return;
          }

          const previousPreview = store.previews()[type];

          if (previousPreview) {
            URL.revokeObjectURL(previousPreview);
          }

          markPhotoStatus(type, 'idle', {
            progress: 0,
          });

          patchState(store, {
            selectedFiles: {
              ...store.selectedFiles(),
              [type]: file,
            },
            previews: {
              ...store.previews(),
              [type]: URL.createObjectURL(file),
            },
            draftDirty: true,
            error: null,
          });
        },

        retryFailedPhoto(type: ProgressPhotoType): void {
          markPhotoStatus(type, 'idle', {
            progress: 0,
          });
          patchState(store, {
            error: null,
          });
        },

        removeSelectedPhoto(type: ProgressPhotoType): void {
          const nextFiles = { ...store.selectedFiles() };
          const nextPreviews = { ...store.previews() };

          if (nextPreviews[type]) {
            URL.revokeObjectURL(nextPreviews[type]!);
          }

          delete nextFiles[type];
          delete nextPreviews[type];

          markPhotoStatus(type, 'idle', {
            progress: 0,
          });

          patchState(store, {
            selectedFiles: nextFiles,
            previews: nextPreviews,
            draftDirty: true,
          });
        },

        async saveWeeklyCheckIn(): Promise<void> {
          await runSaveWeeklyCheckIn();
        },

        async updateWeeklyCheckIn(): Promise<void> {
          await runSaveWeeklyCheckIn();
        },

        async deleteStoredPhoto(type: ProgressPhotoType): Promise<void> {
          const uid = store._authStore.userId();
          const currentCheckIn = store.currentCheckIn();

          if (!uid || !currentCheckIn) {
            return;
          }

          patchState(store, {
            deleting: true,
            error: null,
          });

          try {
            const deletionResult = await store._weeklyProgressRepo.deletePhoto(
              uid,
              currentCheckIn.weekId,
              type
            );
            const nextCurrentCheckIn = mergeCheckIn(currentCheckIn, {
              status: 'draft',
            });
            delete nextCurrentCheckIn.photos[type];

            patchState(store, {
              currentCheckIn: nextCurrentCheckIn,
              selectedCheckIn:
                store.selectedCheckIn()?.weekId === currentCheckIn.weekId
                  ? nextCurrentCheckIn
                  : store.selectedCheckIn(),
              deleting: false,
              draftDirty: false,
              error:
                deletionResult.failedPaths.length > 0
                  ? `Se elimino la metadata, pero quedaron archivos pendientes: ${deletionResult.failedPaths.join(', ')}`
                  : null,
            });
          } catch (error) {
            patchState(store, {
              deleting: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'No fue posible eliminar la foto.',
            });
          }
        },

        async deleteCheckIn(): Promise<void> {
          const uid = store._authStore.userId();
          const currentCheckIn = store.currentCheckIn();

          if (!uid || !currentCheckIn) {
            return;
          }

          patchState(store, {
            deleting: true,
            error: null,
          });

          try {
            const deletionResult = await store._weeklyProgressRepo.deleteCheckIn(
              uid,
              currentCheckIn.weekId
            );
            const monthItems =
              store.monthlyCheckIns()[currentCheckIn.monthKey] ?? [];

            for (const preview of Object.values(store.previews())) {
              if (preview) {
                URL.revokeObjectURL(preview);
              }
            }

            patchState(store, {
              deleting: false,
              currentCheckIn: createDraftCheckIn({ uid }),
              selectedCheckIn: null,
              monthlyCheckIns: {
                ...store.monthlyCheckIns(),
                [currentCheckIn.monthKey]: monthItems.filter(
                  (item) => item.weekId !== currentCheckIn.weekId
                ),
              },
              selectedFiles: {},
              previews: {},
              uploadProgress: { ...EMPTY_UPLOAD_PROGRESS },
              photoStatuses: { ...EMPTY_PHOTO_STATUS },
              photoErrors: {},
              draftDirty: false,
              error:
                deletionResult.failedPaths.length > 0
                  ? `El check-in fue eliminado, pero quedaron archivos pendientes: ${deletionResult.failedPaths.join(', ')}`
                  : null,
            });
          } catch (error) {
            patchState(store, {
              deleting: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'No fue posible eliminar el check-in.',
            });
          }
        },

        resetDraft(): void {
          const uid = store._authStore.userId();

          if (!uid) {
            return;
          }

          for (const type of Object.keys(store.previews()) as ProgressPhotoType[]) {
            releasePreview(type);
          }

          resetTransientPhotoState();
          patchState(store, {
            currentCheckIn: createDraftCheckIn({ uid }),
            error: null,
          });
        },

        discardUnsavedChanges(): void {
          const currentCheckIn = store.currentCheckIn();
          const uid = store._authStore.userId();

          for (const type of Object.keys(store.previews()) as ProgressPhotoType[]) {
            releasePreview(type);
          }

          patchState(store, {
            currentCheckIn:
              currentCheckIn?.id && currentCheckIn.status !== 'draft'
                ? {
                    ...currentCheckIn,
                  }
                : uid
                  ? createDraftCheckIn({ uid })
                  : null,
            selectedFiles: {},
            previews: {},
            uploadProgress: { ...EMPTY_UPLOAD_PROGRESS },
            photoStatuses: { ...EMPTY_PHOTO_STATUS },
            photoErrors: {},
            draftDirty: false,
            error: null,
          });
        },

        acceptProgressPhotoConsent(): void {
          patchState(store, {
            consentAccepted: true,
            draftDirty: true,
          });
        },
      };
    })
  );
}
