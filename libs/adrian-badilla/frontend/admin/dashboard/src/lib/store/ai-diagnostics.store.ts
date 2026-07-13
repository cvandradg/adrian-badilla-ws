import { computed, inject } from '@angular/core';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  AI_ROUTINE_COACH_RESPONSE_SCHEMA,
  AIRoutineCoachResponseApplier,
  AIRoutineCoachFacade,
  AIRoutineCoachResponseValidator,
  type AIRoutineCoachAppliedResult,
  AIUserContextBuilder,
  AssignedRoutineFacade,
  type AIAvailableExerciseAlternative,
  type AIRoutineCoachContext,
  type AIRoutineCoachResponse,
  type AIRoutineCoachValidationResult,
  type AssignedRoutine,
  type AIUserContext,
  type AIUserContextSource,
  type RoutineRecommendationResult,
  RoutineRecommendationFacade,
} from '@adrian-badilla/ai';
import type { Exercise } from '@admin/exercise-library';
import { firstValueFrom } from 'rxjs';

interface UserDocumentRecord {
  uid?: string;
  displayName?: string;
  gender?: string | null;
  healthProfile?: AIUserContextSource['healthProfile'];
  athleteProfile?: AIUserContextSource['athleteProfile'];
  ageYears?: number | null;
  heightCm?: number | null;
  weightKg?: number | null;
  bodyFatPercent?: number | null;
}

interface AICoachValidationSnapshot extends AIRoutineCoachValidationResult {
  checkedAt: string;
}

const DEFAULT_SIMULATED_COACH_RESPONSE: AIRoutineCoachResponse = {
  summary: 'Respuesta simulada para probar el applier.',
  adaptations: [],
  warnings: [],
  coachNotes: [],
  confidence: 1,
  exerciseChanges: [],
  volumeChanges: [],
  equipmentChanges: [],
  reviewRequired: false,
};

interface AiDiagnosticsState {
  userId: string;
  userContext: AIUserContext | null;
  recommendations: RoutineRecommendationResult[];
  loadingRecommendations: boolean;
  recommendationError: string | null;
  latestAssignment: AssignedRoutine | null;
  assigningRoutine: boolean;
  assignmentError: string | null;
  activeAssignment: AssignedRoutine | null;
  loadingActiveAssignment: boolean;
  activeAssignmentError: string | null;
  aiCoachContext: AIRoutineCoachContext | null;
  aiCoachPrompt: string;
  aiCoachResponse: AIRoutineCoachResponse | null;
  aiCoachValidation: AICoachValidationSnapshot | null;
  aiCoachError: string | null;
  generatingAiCoachPreview: boolean;
  simulatedCoachResponse: string;
  coachResponseValidation: AICoachValidationSnapshot | null;
  appliedCoachResult: AIRoutineCoachAppliedResult | null;
  applyingCoachResponse: boolean;
  coachApplyError: string | null;
  availableExerciseAlternatives: AIAvailableExerciseAlternative[];
  exerciseLibrary: Exercise[];
  showRecommendationDebug: boolean;
  showActiveAssignmentDebug: boolean;
}

function serializeError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  return 'Ocurrio un error inesperado.';
}

function buildUserContextSource(
  userId: string,
  userRecord: UserDocumentRecord | null | undefined
): AIUserContextSource {
  if (!userRecord) {
    throw new Error(`User profile not found for "${userId}".`);
  }

  return {
    uid: userRecord.uid ?? userId,
    userId,
    displayName: userRecord.displayName ?? '',
    healthProfile: userRecord.healthProfile ?? null,
    athleteProfile: userRecord.athleteProfile ?? null,
    gender: userRecord.gender ?? null,
    ageYears: userRecord.ageYears ?? null,
    heightCm: userRecord.heightCm ?? null,
    weightKg: userRecord.weightKg ?? null,
    bodyFatPercent: userRecord.bodyFatPercent ?? null,
  };
}

function countAssignedExercises(assignment: AssignedRoutine | null): number {
  if (!assignment) {
    return 0;
  }

  return assignment.days.reduce(
    (total, day) => total + day.exercises.length,
    0
  );
}

function buildValidationSnapshot(
  validation: AIRoutineCoachValidationResult
): AICoachValidationSnapshot {
  return {
    ...validation,
    checkedAt: new Date().toISOString(),
  };
}

export function stringifyCoachResponse(response: AIRoutineCoachResponse): string {
  return JSON.stringify(response, null, 2);
}

export function parseSimulatedCoachResponse(
  responseText: string
): AIRoutineCoachResponse {
  return JSON.parse(responseText) as AIRoutineCoachResponse;
}

export function createReplacementExampleResponse(input: {
  recommendation: RoutineRecommendationResult | null;
  aiCoachContext: AIRoutineCoachContext | null;
}): AIRoutineCoachResponse | null {
  const { recommendation, aiCoachContext } = input;
  const originalExerciseId =
    recommendation?.candidate.resolvedExercises[0]?.exercise.id ?? null;
  const replacementExerciseId =
    aiCoachContext?.availableExerciseAlternatives[0]?.exerciseId ?? null;

  if (!originalExerciseId || !replacementExerciseId) {
    return null;
  }

  return {
    ...DEFAULT_SIMULATED_COACH_RESPONSE,
    summary: 'Respuesta simulada con reemplazo real para probar el applier.',
    exerciseChanges: [
      {
        action: 'replace',
        exerciseId: originalExerciseId,
        replacementExerciseId,
        reason: 'Simulacion de reemplazo con alternativa real.',
      },
    ],
  };
}

type RecommendationWithAlternatives = RoutineRecommendationResult & {
  availableExerciseAlternatives: AIAvailableExerciseAlternative[];
};

export const aiDiagnosticsStore = signalStore(
  { providedIn: 'root' },
  withState<AiDiagnosticsState>({
    userId: '',
    userContext: null,
    recommendations: [],
    loadingRecommendations: false,
    recommendationError: null,
    latestAssignment: null,
    assigningRoutine: false,
    assignmentError: null,
    activeAssignment: null,
    loadingActiveAssignment: false,
    activeAssignmentError: null,
    aiCoachContext: null,
    aiCoachPrompt: '',
    aiCoachResponse: null,
    aiCoachValidation: null,
    aiCoachError: null,
    generatingAiCoachPreview: false,
    simulatedCoachResponse: stringifyCoachResponse(
      DEFAULT_SIMULATED_COACH_RESPONSE
    ),
    coachResponseValidation: null,
    appliedCoachResult: null,
    applyingCoachResponse: false,
    coachApplyError: null,
    availableExerciseAlternatives: [],
    exerciseLibrary: [],
    showRecommendationDebug: false,
    showActiveAssignmentDebug: false,
  }),
  withComputed((store) => ({
    topRecommendations: computed(() => store.recommendations().slice(0, 5)),
    topRecommendation: computed(() => store.recommendations()[0] ?? null),
    recommendationDebugJson: computed(() =>
      JSON.stringify(
        {
          userId: store.userId(),
          userContext: store.userContext(),
          recommendations: store.recommendations(),
        },
        null,
        2
      )
    ),
    activeAssignmentDebugJson: computed(() =>
      JSON.stringify(store.activeAssignment(), null, 2)
    ),
    aiCoachContextJson: computed(() =>
      JSON.stringify(store.aiCoachContext(), null, 2)
    ),
    aiCoachSchemaJson: computed(() =>
      JSON.stringify(AI_ROUTINE_COACH_RESPONSE_SCHEMA, null, 2)
    ),
    aiCoachResponseJson: computed(() =>
      JSON.stringify(store.aiCoachResponse(), null, 2)
    ),
    aiCoachValidationJson: computed(() =>
      JSON.stringify(store.aiCoachValidation(), null, 2)
    ),
    simulatedCoachResponseExampleAvailable: computed(
      () =>
        createReplacementExampleResponse({
          recommendation: store.recommendations()[0] ?? null,
          aiCoachContext: store.aiCoachContext(),
        }) != null
    ),
    coachResponseValidationJson: computed(() =>
      JSON.stringify(store.coachResponseValidation(), null, 2)
    ),
    appliedCoachResultJson: computed(() =>
      JSON.stringify(store.appliedCoachResult(), null, 2)
    ),
    latestAssignmentDayCount: computed(
      () => store.latestAssignment()?.days.length ?? 0
    ),
    latestAssignmentExerciseCount: computed(() =>
      countAssignedExercises(store.latestAssignment())
    ),
    activeAssignmentExerciseCount: computed(() =>
      countAssignedExercises(store.activeAssignment())
    ),
  })),
  withMethods((store) => {
    const firestore = inject(Firestore);
    const recommendationFacade = inject(RoutineRecommendationFacade);
    const assignedRoutineFacade = inject(AssignedRoutineFacade);
    const userContextBuilder = new AIUserContextBuilder();
    const aiRoutineCoachFacade = inject(AIRoutineCoachFacade);
    const aiRoutineCoachValidator = new AIRoutineCoachResponseValidator();
    const aiRoutineCoachResponseApplier = new AIRoutineCoachResponseApplier();

    async function loadUserContext(userId: string): Promise<AIUserContext> {
      const userRef = doc(firestore, 'users', userId);
      const snapshot = await getDoc(userRef);

      if (!snapshot.exists()) {
        throw new Error(`No se encontro el usuario "${userId}".`);
      }

      return userContextBuilder.build(
        buildUserContextSource(
          userId,
          snapshot.data() as UserDocumentRecord | undefined
        )
      );
    }

    function normalizedUserId(): string {
      return store.userId().trim();
    }

    function resetAICoachPreview(): void {
      patchState(store, {
        aiCoachContext: null,
        aiCoachPrompt: '',
        aiCoachResponse: null,
        aiCoachValidation: null,
        aiCoachError: null,
        generatingAiCoachPreview: false,
        simulatedCoachResponse: stringifyCoachResponse(
          DEFAULT_SIMULATED_COACH_RESPONSE
        ),
        coachResponseValidation: null,
        appliedCoachResult: null,
        applyingCoachResponse: false,
        coachApplyError: null,
        availableExerciseAlternatives: [],
        exerciseLibrary: [],
      });
    }

    return {
      setUserId(userId: string): void {
        patchState(store, { userId });
      },

      setSimulatedCoachResponse(response: string): void {
        patchState(store, {
          simulatedCoachResponse: response,
          coachApplyError: null,
        });
      },

      resetSimulatedCoachResponse(): void {
        patchState(store, {
          simulatedCoachResponse: stringifyCoachResponse(
            DEFAULT_SIMULATED_COACH_RESPONSE
          ),
          coachResponseValidation: null,
          appliedCoachResult: null,
          coachApplyError: null,
        });
      },

      loadEmptySimulatedCoachResponse(): void {
        patchState(store, {
          simulatedCoachResponse: stringifyCoachResponse(
            DEFAULT_SIMULATED_COACH_RESPONSE
          ),
          coachResponseValidation: null,
          appliedCoachResult: null,
          coachApplyError: null,
        });
      },

      loadReplacementExampleSimulatedCoachResponse(): void {
        const topRecommendation = store.recommendations()[0] ?? null;
        const example = createReplacementExampleResponse({
          recommendation: topRecommendation,
          aiCoachContext: store.aiCoachContext(),
        });

        if (!example) {
          patchState(store, {
            coachApplyError:
              'No existe una alternativa valida para construir el ejemplo de reemplazo.',
          });
          return;
        }

        patchState(store, {
          simulatedCoachResponse: stringifyCoachResponse(example),
          coachResponseValidation: null,
          appliedCoachResult: null,
          coachApplyError: null,
        });
      },

      validateSimulatedCoachResponse(): void {
        try {
          const parsed = parseSimulatedCoachResponse(store.simulatedCoachResponse());
          const validation = buildValidationSnapshot(
            aiRoutineCoachValidator.validate(parsed)
          );

          patchState(store, {
            coachResponseValidation: validation,
            coachApplyError: validation.valid ? null : 'La respuesta simulada no es valida.',
          });
        } catch (error) {
          patchState(store, {
            coachResponseValidation: buildValidationSnapshot({
              valid: false,
              errors: [serializeError(error)],
            }),
            coachApplyError: 'El JSON de la respuesta simulada no es valido.',
          });
        }
      },

      async runRecommendationDiagnostics(): Promise<void> {
        const userId = normalizedUserId();

        if (!userId) {
          patchState(store, {
            recommendationError:
              'Ingresa un userId para probar el Recommendation Engine.',
            recommendations: [],
            userContext: null,
          });
          resetAICoachPreview();
          return;
        }

        patchState(store, {
          loadingRecommendations: true,
          recommendationError: null,
          recommendations: [],
          userContext: null,
          showRecommendationDebug: false,
        });
        resetAICoachPreview();

        try {
          const userContext = await loadUserContext(userId);
          const recommendations = await firstValueFrom(
            recommendationFacade.getRoutineRecommendationsForUser(userId)
          );

          patchState(store, {
            userContext,
            recommendations,
            loadingRecommendations: false,
          });
        } catch (error) {
          patchState(store, {
            loadingRecommendations: false,
            recommendationError: serializeError(error),
            recommendations: [],
          });
        }
      },

      async generateAiCoachPreview(): Promise<void> {
        const userContext = store.userContext();
        const topRecommendation = store.topRecommendation();

        if (!userContext || !topRecommendation) {
          patchState(store, {
            aiCoachError:
              'Primero ejecuta el diagnostico y asegurate de tener una recomendacion top.',
          });
          return;
        }

        patchState(store, {
          generatingAiCoachPreview: true,
          aiCoachError: null,
        });

        try {
          const exerciseLibrary = await firstValueFrom(
            recommendationFacade.getActiveExercises()
          );
          const aiCoachContext = aiRoutineCoachFacade.buildContext({
            userContext,
            recommendedRoutine: topRecommendation,
            exerciseLibrary,
          });
          const aiCoachPrompt =
            aiRoutineCoachFacade.buildPrompt(aiCoachContext);
          const aiCoachResponse =
            aiRoutineCoachFacade.coachRoutine(aiCoachContext);
          const aiCoachValidation = buildValidationSnapshot(
            aiRoutineCoachValidator.validate(aiCoachResponse)
          );

          patchState(store, {
            aiCoachContext,
            aiCoachPrompt,
            aiCoachResponse,
            aiCoachValidation,
            availableExerciseAlternatives:
              aiCoachContext.availableExerciseAlternatives,
            exerciseLibrary,
            generatingAiCoachPreview: false,
            appliedCoachResult: null,
            coachApplyError: null,
          });
        } catch (error) {
          patchState(store, {
            generatingAiCoachPreview: false,
            aiCoachError: serializeError(error),
          });
        }
      },

      applySimulatedCoachResponse(): void {
        const topRecommendation = store.recommendations()[0] ?? null;
        const aiCoachContext = store.aiCoachContext();

        if (!topRecommendation) {
          patchState(store, {
            coachApplyError:
              'No existe una recomendacion top para aplicar la respuesta simulada.',
          });
          return;
        }

        if (!aiCoachContext) {
          patchState(store, {
            coachApplyError:
              'Primero genera el AI Coach Context antes de aplicar la simulacion.',
          });
          return;
        }

        patchState(store, {
          applyingCoachResponse: true,
          coachApplyError: null,
        });

        try {
          const parsed = parseSimulatedCoachResponse(store.simulatedCoachResponse());
          const validation = buildValidationSnapshot(
            aiRoutineCoachValidator.validate(parsed)
          );

          if (!validation.valid) {
            patchState(store, {
              coachResponseValidation: validation,
              applyingCoachResponse: false,
              coachApplyError:
                'La respuesta simulada es invalida. Corrige los errores antes de aplicar.',
            });
            return;
          }

          const recommendationWithAlternatives: RecommendationWithAlternatives = {
            ...topRecommendation,
            availableExerciseAlternatives:
              aiCoachContext.availableExerciseAlternatives,
          };
          const appliedCoachResult = aiRoutineCoachResponseApplier.apply(
            recommendationWithAlternatives,
            parsed
          );

          patchState(store, {
            coachResponseValidation: validation,
            appliedCoachResult,
            applyingCoachResponse: false,
          });
        } catch (error) {
          patchState(store, {
            applyingCoachResponse: false,
            appliedCoachResult: null,
            coachApplyError: serializeError(error),
          });
        }
      },

      async assignTopRoutine(): Promise<void> {
        const userId = normalizedUserId();

        if (!userId) {
          patchState(store, {
            assignmentError: 'Ingresa un userId antes de asignar una rutina.',
          });
          return;
        }

        patchState(store, {
          assigningRoutine: true,
          assignmentError: null,
          latestAssignment: null,
        });

        try {
          const assignedRoutine = await firstValueFrom(
            assignedRoutineFacade.assignTopRecommendedRoutineToUser(userId)
          );

          if (!assignedRoutine) {
            throw new Error(
              'No se pudo asignar una rutina porque no existe una recomendacion top para este usuario.'
            );
          }

          patchState(store, {
            latestAssignment: assignedRoutine,
            assigningRoutine: false,
          });
        } catch (error) {
          patchState(store, {
            assigningRoutine: false,
            assignmentError: serializeError(error),
          });
        }
      },

      async loadActiveAssignment(): Promise<void> {
        const userId = normalizedUserId();

        if (!userId) {
          patchState(store, {
            activeAssignmentError:
              'Ingresa un userId antes de consultar la rutina activa.',
          });
          return;
        }

        patchState(store, {
          loadingActiveAssignment: true,
          activeAssignmentError: null,
          activeAssignment: null,
          showActiveAssignmentDebug: false,
        });

        try {
          const activeAssignment = await firstValueFrom(
            assignedRoutineFacade.getActiveAssignedRoutine(userId)
          );

          patchState(store, {
            activeAssignment,
            loadingActiveAssignment: false,
          });
        } catch (error) {
          patchState(store, {
            loadingActiveAssignment: false,
            activeAssignmentError: serializeError(error),
          });
        }
      },

      toggleRecommendationDebug(): void {
        patchState(store, {
          showRecommendationDebug: !store.showRecommendationDebug(),
        });
      },

      toggleActiveAssignmentDebug(): void {
        patchState(store, {
          showActiveAssignmentDebug: !store.showActiveAssignmentDebug(),
        });
      },
    };
  })
);

export type AiDiagnosticsStore = InstanceType<typeof aiDiagnosticsStore>;
