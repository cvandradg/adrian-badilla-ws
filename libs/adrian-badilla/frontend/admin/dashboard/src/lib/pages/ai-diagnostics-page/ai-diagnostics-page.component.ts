import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import type { Exercise } from '@admin/exercise-library';
import type {
  AIAvailableExerciseAlternative,
  AIRoutineCoachAppliedResult,
  AIRoutineCoachContext,
  AIRoutineCoachValidationResult,
  AIUserContext,
  AssignedRoutine,
  RoutineRecommendationPenalty,
  RoutineRecommendationReason,
  RoutineRecommendationResult,
} from '@adrian-badilla/ai';
import { CollapsibleCardComponent } from '../../components/collapsible-card/collapsible-card.component';
import { aiDiagnosticsStore } from '../../store/ai-diagnostics.store';

type ScoreBreakdownType = 'bonus' | 'penalty' | 'neutral';
type DiagnosticsView = 'summary' | 'technical';
type DiagnosticsStatusTone =
  | 'success'
  | 'info'
  | 'warn'
  | 'danger'
  | 'secondary';
type DiagnosticsSectionId =
  | 'summary-result'
  | 'summary-flow'
  | 'summary-context'
  | 'summary-candidates'
  | 'summary-coach'
  | 'technical-json'
  | 'technical-simulator'
  | 'technical-assignment';

interface ScoreBreakdownItem {
  criterion: string;
  type: ScoreBreakdownType;
  points: number;
  description: string;
  code: string;
}

interface ExercisePreviewDetail {
  id: string;
  name: string;
  primaryMuscles: string[];
  movementPattern: string;
  requiredEquipment: string[];
  isUnknown: boolean;
}

interface AppliedExerciseChangePreview {
  original: ExercisePreviewDetail;
  replacement: ExercisePreviewDetail | null;
  reason: string;
  matchReasons: string[];
}

interface JsonStructureSummary {
  lines: number;
  bytes: number;
  properties: number;
  objects: number;
  arrays: number;
}

interface DiagnosticsStatusDescriptor {
  label: string;
  tone: DiagnosticsStatusTone;
  description: string;
}

interface DiagnosticsSectionLink {
  id: DiagnosticsSectionId;
  label: string;
  description: string;
}

interface DiagnosticStep {
  title: string;
  description: string;
  tone: DiagnosticsStatusTone;
}

function timestampToDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return value;
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof value.toDate === 'function'
  ) {
    return value.toDate();
  }

  return null;
}

function booleanSeverity(
  value: boolean
): 'success' | 'danger' | 'secondary' | 'warn' {
  return value ? 'success' : 'danger';
}

function booleanLabel(value: boolean): string {
  return value ? 'Ready' : 'Missing';
}

function pointsLabel(
  item: RoutineRecommendationReason | RoutineRecommendationPenalty
): string {
  return `${item.label} (${item.points > 0 ? '+' : ''}${item.points})`;
}

function formatCodeLabel(code: string): string {
  return code
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function fallbackValue(value: string | null | undefined): string {
  return value && value.trim().length > 0 ? value : 'N/A';
}

function fallbackList(values: readonly string[] | null | undefined): string[] {
  return values && values.length > 0 ? [...values] : ['N/A'];
}

function buildUnknownExerciseDetail(exerciseId: string): ExercisePreviewDetail {
  return {
    id: exerciseId,
    name: 'Ejercicio desconocido',
    primaryMuscles: ['N/A'],
    movementPattern: 'N/A',
    requiredEquipment: ['N/A'],
    isUnknown: true,
  };
}

function countTextLines(value: string): number {
  if (!value) {
    return 0;
  }

  return value.split(/\r?\n/).length;
}

function countTextBytes(value: string): number {
  return new TextEncoder().encode(value).length;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  return `${(bytes / 1024).toFixed(1)} KB`;
}

function summarizeJsonStructure(
  value: unknown
): Omit<JsonStructureSummary, 'lines' | 'bytes'> {
  if (Array.isArray(value)) {
    return value.reduce(
      (summary, item) => {
        const itemSummary = summarizeJsonStructure(item);

        return {
          properties: summary.properties + itemSummary.properties,
          objects: summary.objects + itemSummary.objects,
          arrays: summary.arrays + itemSummary.arrays,
        };
      },
      { properties: 0, objects: 0, arrays: 1 }
    );
  }

  if (typeof value === 'object' && value !== null) {
    const entries = Object.values(value);

    return entries.reduce(
      (summary, item) => {
        const itemSummary = summarizeJsonStructure(item);

        return {
          properties: summary.properties + itemSummary.properties,
          objects: summary.objects + itemSummary.objects,
          arrays: summary.arrays + itemSummary.arrays,
        };
      },
      {
        properties: Object.keys(value).length,
        objects: 1,
        arrays: 0,
      }
    );
  }

  return { properties: 0, objects: 0, arrays: 0 };
}

function buildJsonStructureSummary(jsonText: string): JsonStructureSummary {
  const parsed = JSON.parse(jsonText) as unknown;
  const structure = summarizeJsonStructure(parsed);

  return {
    lines: countTextLines(jsonText),
    bytes: countTextBytes(jsonText),
    properties: structure.properties,
    objects: structure.objects,
    arrays: structure.arrays,
  };
}

function buildScoreBreakdown(
  recommendation: RoutineRecommendationResult
): ScoreBreakdownItem[] {
  const reasonItems: ScoreBreakdownItem[] = recommendation.reasons.map(
    (reason) => ({
      criterion: formatCodeLabel(reason.code),
      type: 'bonus',
      points: reason.points,
      description: reason.label,
      code: reason.code,
    })
  );

  const penaltyItems: ScoreBreakdownItem[] = recommendation.penalties.map(
    (penalty) => ({
      criterion: formatCodeLabel(penalty.code),
      type: 'penalty',
      points: penalty.points,
      description: penalty.label,
      code: penalty.code,
    })
  );

  const warningItems: ScoreBreakdownItem[] = recommendation.warnings.map(
    (warning) => ({
      criterion: formatCodeLabel(warning),
      type: 'neutral',
      points: 0,
      description: `Warning detectado por el engine: ${warning}.`,
      code: warning,
    })
  );

  const adaptationItems: ScoreBreakdownItem[] =
    recommendation.requiredAdaptations.map((adaptation) => ({
      criterion: formatCodeLabel(adaptation),
      type: 'neutral',
      points: 0,
      description: `Adaptacion sugerida: ${adaptation}.`,
      code: adaptation,
    }));

  return [...reasonItems, ...penaltyItems, ...warningItems, ...adaptationItems];
}

@Component({
  selector: 'admin-ai-diagnostics-page',
  standalone: true,
  imports: [
    RouterModule,
    DatePipe,
    ButtonModule,
    InputTextModule,
    ProgressSpinnerModule,
    TagModule,
    CollapsibleCardComponent,
  ],
  templateUrl: './ai-diagnostics-page.component.html',
  styleUrl: './ai-diagnostics-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiDiagnosticsPageComponent {
  readonly store = inject(aiDiagnosticsStore);
  readonly timestampToDate = timestampToDate;
  readonly booleanSeverity = booleanSeverity;
  readonly booleanLabel = booleanLabel;
  readonly pointsLabel = pointsLabel;
  readonly scoreBreakdown = buildScoreBreakdown;

  readonly activeView = signal<DiagnosticsView>('summary');
  readonly lastDiagnosticsRunAt = signal<Date | null>(null);
  readonly copyFeedback = signal<string | null>(null);
  readonly expandAllVersion = signal(0);
  readonly collapseAllVersion = signal(0);

  readonly summarySections: readonly DiagnosticsSectionLink[] = [
    {
      id: 'summary-result',
      label: 'Resultado',
      description: 'Rutina ganadora y score final',
    },
    {
      id: 'summary-flow',
      label: 'Explicacion',
      description: 'Como llego el engine a esta conclusion',
    },
    {
      id: 'summary-context',
      label: 'Contexto',
      description: 'Datos del usuario realmente evaluados',
    },
    {
      id: 'summary-candidates',
      label: 'Candidatos',
      description: 'Comparacion compacta de las rutinas',
    },
    {
      id: 'summary-coach',
      label: 'AI Coach',
      description: 'Preview del contexto para la futura IA',
    },
  ];

  readonly technicalSections: readonly DiagnosticsSectionLink[] = [
    {
      id: 'technical-json',
      label: 'JSON tecnico',
      description: 'Entrada, salida y trazabilidad completa',
    },
    {
      id: 'technical-simulator',
      label: 'Simulator',
      description: 'Respuesta simulada y rutina adaptada',
    },
    {
      id: 'technical-assignment',
      label: 'Assigned Routine',
      description: 'Flujo de asignacion y agregado hidratado',
    },
  ];

  setActiveView(view: DiagnosticsView): void {
    this.activeView.set(view);
  }

  async copyText(value: string, label: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      this.copyFeedback.set(`${label} copiado.`);
      window.setTimeout(() => {
        if (this.copyFeedback() === `${label} copiado.`) {
          this.copyFeedback.set(null);
        }
      }, 2000);
    } catch {
      this.copyFeedback.set(`No se pudo copiar ${label.toLowerCase()}.`);
    }
  }

  async copyRecommendationSnapshot(): Promise<void> {
    await this.copyText(this.store.recommendationDebugJson(), 'Resultado');
  }

  runDiagnostics(): void {
    this.lastDiagnosticsRunAt.set(new Date());
    void this.store.runRecommendationDiagnostics();
  }

  generateAiCoachPreview(): void {
    void this.store.generateAiCoachPreview();
  }

  assignTopRoutine(): void {
    void this.store.assignTopRoutine();
  }

  loadActiveAssignment(): void {
    void this.store.loadActiveAssignment();
  }

  expandAllPanels(): void {
    this.expandAllVersion.update((value) => value + 1);
  }

  collapseAllPanels(): void {
    this.collapseAllVersion.update((value) => value + 1);
  }

  scrollToSection(sectionId: DiagnosticsSectionId): void {
    const target = document.getElementById(sectionId);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  visibleSections(): readonly DiagnosticsSectionLink[] {
    return this.activeView() === 'summary'
      ? this.summarySections
      : this.technicalSections;
  }

  statusDescriptor(): DiagnosticsStatusDescriptor {
    if (this.store.loadingRecommendations()) {
      return {
        label: 'Analizando',
        tone: 'info',
        description: 'Se esta ejecutando el Recommendation Engine con los datos actuales.',
      };
    }

    if (this.store.recommendationError()) {
      return {
        label: 'Error',
        tone: 'danger',
        description: 'El analisis encontro un problema y requiere revision.',
      };
    }

    if (this.store.topRecommendations().length > 0) {
      return {
        label: 'Completado',
        tone: 'success',
        description: 'Ya existe un resultado listo para explicar o depurar.',
      };
    }

    if (this.store.userId().trim().length > 0) {
      return {
        label: 'Listo',
        tone: 'warn',
        description: 'El userId esta cargado. Falta ejecutar el analisis.',
      };
    }

    return {
      label: 'Listo',
      tone: 'secondary',
      description: 'Ingresa un userId para generar el diagnostico.',
    };
  }

  hasMissingFields(userContext: AIUserContext | null): boolean {
    return (userContext?.readiness.missingFields.length ?? 0) > 0;
  }

  scorePercent(score: number): number {
    return Math.max(0, Math.min(100, score));
  }

  scoreTone(score: number): 'excellent' | 'good' | 'fair' | 'low' {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'low';
  }

  scoreTypeLabel(type: ScoreBreakdownType): string {
    switch (type) {
      case 'bonus':
        return 'bonus';
      case 'penalty':
        return 'penalty';
      default:
        return 'neutral';
    }
  }

  scorePointsLabel(points: number): string {
    if (points > 0) return `+${points}`;
    return `${points}`;
  }

  compatibilityLabel(score: number): string {
    switch (this.scoreTone(score)) {
      case 'excellent':
        return 'Compatibilidad alta';
      case 'good':
        return 'Compatibilidad buena';
      case 'fair':
        return 'Compatibilidad media';
      default:
        return 'Compatibilidad baja';
    }
  }

  lastRunText(): string {
    const lastRunAt = this.lastDiagnosticsRunAt();
    return lastRunAt ? lastRunAt.toLocaleString() : 'Aun no ejecutado';
  }

  shouldShowEmptyState(): boolean {
    return (
      !this.store.loadingRecommendations() &&
      !this.store.recommendationError() &&
      !this.store.userContext() &&
      this.store.topRecommendations().length === 0
    );
  }

  highlightReasons(recommendation: RoutineRecommendationResult): string[] {
    return recommendation.reasons.slice(0, 3).map((reason) => reason.label);
  }

  primaryPenalty(recommendation: RoutineRecommendationResult): string {
    return recommendation.penalties[0]?.label ?? 'Sin penalizacion principal';
  }

  diagnosticSteps(): DiagnosticStep[] {
    const userContext = this.store.userContext();
    const recommendations = this.store.topRecommendations();
    const topRecommendation = this.store.topRecommendation();

    if (!userContext) {
      return [];
    }

    const steps: DiagnosticStep[] = [
      {
        title: '1. Datos recibidos',
        description: `Se cargo el usuario ${userContext.displayName || userContext.userId} con su contexto real.`,
        tone: 'success',
      },
      {
        title: '2. Normalizacion',
        description: `El engine recibio goal ${userContext.athleteProfile.goal || 'N/A'}, experiencia ${userContext.athleteProfile.trainingExperience || 'N/A'} y readiness ${userContext.readiness.isWorkoutRecommendationReady ? 'listo' : 'incompleto'}.`,
        tone: userContext.readiness.isWorkoutRecommendationReady
          ? 'success'
          : 'warn',
      },
      {
        title: '3. Evaluacion',
        description: `Se evaluaron ${recommendations.length} candidatos y se calcularon bonus, penalizaciones y warnings por rutina.`,
        tone: recommendations.length > 0 ? 'info' : 'secondary',
      },
    ];

    if (topRecommendation) {
      steps.push({
        title: '4. Seleccion final',
        description: `${topRecommendation.routineTemplate.name} quedo en rank #${topRecommendation.rank} con ${topRecommendation.normalizedScore}/100.`,
        tone: 'success',
      });
    }

    return steps;
  }

  assignedExerciseCount(assignment: AssignedRoutine | null): number {
    if (!assignment) {
      return 0;
    }

    return assignment.days.reduce(
      (total, day) => total + day.exercises.length,
      0
    );
  }

  healthRestrictionsSummary(userContext: AIUserContext): string[] {
    const healthRestrictions = userContext.healthRestrictions;

    if (!healthRestrictions) {
      return ['Sin restricciones estructuradas cargadas'];
    }

    const injuries =
      healthRestrictions.injuries?.map(
        (injury) =>
          `${injury.areaId} (${injury.severityId ?? 'N/A'}${injury.notes ? `, ${injury.notes}` : ''})`
      ) ?? [];
    const conditions =
      healthRestrictions.medicalConditions?.map(
        (condition) =>
          `${condition.name || condition.conditionId} (${condition.severityId ?? 'N/A'}${condition.notes ? `, ${condition.notes}` : ''})`
      ) ?? [];

    const summary = [
      healthRestrictions.hasInjury
        ? `Lesiones registradas: ${injuries.join(' | ') || 'Si'}`
        : 'Sin lesiones activas',
      healthRestrictions.hasDisease
        ? `Condiciones registradas: ${conditions.join(' | ') || 'Si'}`
        : 'Sin condiciones medicas activas',
    ];

    return summary;
  }

  aiCoachContextSummary(context: AIRoutineCoachContext | null): string[] {
    if (!context) {
      return [];
    }

    return [
      `Rutina: ${context.recommendedRoutine.routineTemplate.name}`,
      `Score: ${context.recommendedRoutine.score} (${context.recommendedRoutine.normalizedScore}/100)`,
      `Ubicacion: ${context.trainingLocation ?? 'N/A'}`,
      `Dias disponibles: ${context.availableDays.join(', ') || 'N/A'}`,
      `Equipo disponible: ${context.availableEquipment.join(', ') || 'N/A'}`,
      `Musculos prioritarios: ${context.priorityMuscles.join(', ') || 'N/A'}`,
      `Duracion preferida: ${context.preferredSessionDuration ?? 'N/A'} min`,
    ];
  }

  aiCoachAlternativeSummary(
    alternative: AIAvailableExerciseAlternative
  ): string[] {
    return [
      `Musculos principales: ${alternative.primaryMuscles.join(', ') || 'N/A'}`,
      `Patron de movimiento: ${alternative.movementPattern || 'N/A'}`,
      `Region corporal: ${alternative.bodyRegion || 'N/A'}`,
      `Equipo requerido: ${alternative.requiredEquipment.join(', ') || 'N/A'}`,
      `Ubicacion: ${alternative.trainingLocations.join(', ') || 'N/A'}`,
      `Reason: ${alternative.reason}`,
      `matchReasons: ${alternative.matchReasons.join(', ') || 'N/A'}`,
    ];
  }

  aiCoachContextCollapsedSummary(
    context: AIRoutineCoachContext | null,
    contextJson: string
  ): string[] {
    if (!context) {
      return ['Sin contexto generado'];
    }

    return [
      'Usuario listo',
      'Perfil atletico incluido',
      'Salud incluida',
      'Rutina recomendada incluida',
      'Score breakdown incluido',
      'Diagnosticos incluidos',
      `Tamano: ~${countTextLines(contextJson)} lineas`,
    ];
  }

  promptCollapsedSummary(prompt: string): string[] {
    if (!prompt) {
      return ['Sin prompt generado'];
    }

    return [
      'Prompt listo',
      `${countTextLines(prompt)} lineas`,
      formatBytes(countTextBytes(prompt)),
    ];
  }

  jsonSchemaCollapsedSummary(schemaJson: string): string[] {
    const summary = buildJsonStructureSummary(schemaJson);

    return [
      'AIRoutineCoachResponse',
      `${summary.properties} propiedades`,
      `${summary.objects} objetos`,
      `${summary.arrays} arrays`,
    ];
  }

  jsonPayloadCollapsedSummary(title: string, payload: string): string[] {
    if (!payload) {
      return [`Sin contenido para ${title}`];
    }

    return [
      title,
      `${countTextLines(payload)} lineas`,
      formatBytes(countTextBytes(payload)),
    ];
  }

  alternativesCollapsedSummary(
    alternatives: AIAvailableExerciseAlternative[]
  ): string[] {
    if (alternatives.length === 0) {
      return ['Sin alternativas compatibles'];
    }

    return [
      `${alternatives.length} alternativas compatibles`,
      `${alternatives.filter((item) => item.matchReasons.includes('same_primary_muscle')).length} con mismo musculo principal`,
      `${alternatives.filter((item) => item.matchReasons.includes('same_movement_pattern')).length} con mismo patron`,
    ];
  }

  simulatorCollapsedSummary(
    responseText: string,
    validation: AIRoutineCoachValidationResult | null
  ): string[] {
    return [
      validation?.valid ? 'JSON valido' : 'Pendiente de validacion',
      `${countTextLines(responseText)} lineas`,
      formatBytes(countTextBytes(responseText)),
    ];
  }

  adaptedRoutineCollapsedSummary(
    result: AIRoutineCoachAppliedResult | null
  ): string[] {
    if (!result) {
      return ['Aun no hay rutina adaptada'];
    }

    return [
      result.originalRecommendation.routineTemplate.name,
      `${result.appliedExerciseChanges.length + result.appliedVolumeChanges.length} cambios aplicados`,
      `${result.rejectedChanges.length} cambios rechazados`,
      `${result.adaptedRoutineTemplate.days.length} dias adaptados`,
    ];
  }

  appliedWarnings(result: AIRoutineCoachAppliedResult | null): string[] {
    return result?.warnings ?? [];
  }

  exercisePreviewDetail(
    exerciseId: string,
    result: AIRoutineCoachAppliedResult | null
  ): ExercisePreviewDetail {
    const exercise = this.findExerciseById(exerciseId, result);

    if (!exercise) {
      return buildUnknownExerciseDetail(exerciseId);
    }

    return {
      id: exercise.id,
      name: exercise.name,
      primaryMuscles: fallbackList(exercise.primaryMuscles),
      movementPattern: fallbackValue(exercise.movementPattern),
      requiredEquipment: fallbackList(exercise.requiredEquipment),
      isUnknown: false,
    };
  }

  appliedExerciseChangePreview(
    result: AIRoutineCoachAppliedResult | null,
    exerciseId: string,
    replacementExerciseId: string | null | undefined,
    reason: string
  ): AppliedExerciseChangePreview {
    const alternative = replacementExerciseId
      ? this.store
          .availableExerciseAlternatives()
          .find((item) => item.exerciseId === replacementExerciseId) ?? null
      : null;

    return {
      original: this.exercisePreviewDetail(exerciseId, result),
      replacement: replacementExerciseId
        ? this.exercisePreviewDetail(replacementExerciseId, result)
        : null,
      reason,
      matchReasons: (alternative?.matchReasons ?? []).map((item) =>
        this.matchReasonLabel(item)
      ),
    };
  }

  matchReasonLabel(reason: string): string {
    switch (reason) {
      case 'same_primary_muscle':
        return 'Mismo musculo principal';
      case 'same_movement_pattern':
        return 'Mismo patron de movimiento';
      case 'same_body_region':
        return 'Misma region corporal';
      case 'priority_user_muscle':
        return 'Coincide con un musculo prioritario del usuario';
      case 'shared_goal':
        return 'Comparte el mismo objetivo de entrenamiento';
      case 'compatible_equipment':
        return 'Compatible con el equipo disponible';
      case 'compatible_location':
        return 'Compatible con la ubicacion disponible';
      default:
        return formatCodeLabel(reason);
    }
  }

  validationSeverity(
    validation: AIRoutineCoachValidationResult | null
  ): 'success' | 'danger' | 'secondary' {
    if (!validation) {
      return 'secondary';
    }

    return validation.valid ? 'success' : 'danger';
  }

  private findExerciseById(
    exerciseId: string,
    result: AIRoutineCoachAppliedResult | null
  ): Exercise | null {
    const exerciseLibrary = this.store.exerciseLibrary();
    const resolvedExercises =
      result?.originalRecommendation.candidate.resolvedExercises.map(
        (item) => item.exercise
      ) ?? [];

    return (
      exerciseLibrary.find((exercise) => exercise.id === exerciseId) ??
      resolvedExercises.find((exercise) => exercise.id === exerciseId) ??
      null
    );
  }
}
