import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { athleteProfileStore } from '../../store/athlete-profile.store';
import type {
  AthleteProfileFormData,
  AthleteProfile,
  TrainingExperience,
  TrainingGoal,
  TrainingConsistency,
  PreferredSchedule,
  TrainingLocation,
  TrainingStylePreference,
  AthleteProfileCondition,
  AthleteProfileInjury,
  InjuryArea,
  InjurySeverity,
  DiseaseSeverity,
  AlcoholFrequency,
  MealSlot,
  MedicalConditionType,
} from '../../types/athlete-profile.types';
import {
  type EquipmentId,
  type MuscleId,
  type WeekDayId,
} from '@adrian-badilla/ai';
import {
  TRAINING_EXPERIENCE_LABELS,
  TRAINING_GOAL_LABELS,
  TRAINING_CONSISTENCY_LABELS,
  PREFERRED_SCHEDULE_LABELS,
  TRAINING_LOCATION_OPTIONS,
  TRAINING_STYLE_PREFERENCE_LABELS,
  ALCOHOL_FREQUENCY_LABELS,
  MEAL_SLOT_LABELS,
  TRAINING_TYPE_OPTIONS,
  SPORT_OPTIONS,
  WEEK_DAY_OPTIONS,
  SESSION_DURATION_OPTIONS,
  HOME_EQUIPMENT_OPTIONS,
  MUSCLE_GROUP_OPTIONS,
  INJURY_AREA_OPTIONS,
  INJURY_SEVERITY_LABELS,
  DISEASE_SEVERITY_LABELS,
  MEDICAL_CONDITION_LABELS,
  validateAthleteProfileFormData,
} from '../../types/athlete-profile.types';

// ─── Default form state ────────────────────────────────────────────────────────

function buildDefaultFormData(): AthleteProfileFormData {
  return {
    training: {
      sport: '',
      trainingExperience: 'beginner',
      trainingType: 'strength',
      goal: 'maintain_weight',
      availableDays: [],
      preferredSchedule: 'morning',
      sessionDuration: 60,
      trainingConsistency: 'medium',
      availableEquipment: ['full_gym'],
      // AI-ready optional fields
      trainingLocation: 'gym',
      trainingStylePreference: 'balanced',
      priorityMuscles: [],
      avoidMuscles: [],
    },
    nutrition: {
      followsDiet: false,
      mealSchedule: [],
      foodIntolerances: '',
    },
    health: {
      hasDisease: false,
      diseaseDescription: '',
      hasInjury: false,
      injuryDescription: '',
      injuries: [],
      conditions: [],
      // AI-ready optional severity fields
      injurySeverity: undefined,
      diseaseSeverity: undefined,
    },
    lifestyle: {
      profession: '',
      smoker: false,
      alcohol: 'never',
    },
  };
}

const MAX_PRIORITY_MUSCLES = 3;

function buildEmptyInjury(): AthleteProfileInjury {
  return {
    notes: '',
  };
}

function buildEmptyCondition(): AthleteProfileCondition {
  return {
    type: 'other',
    notes: '',
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * AthleteProfileFormComponent
 *
 * Multi-section questionnaire for the athlete profile.
 * Uses component-local signals for form state — no ReactiveFormsModule.
 *
 * Sections: Entrenamiento · Nutrición · Salud · Estilo de vida
 *
 * On submit: calls `store.saveAthleteProfile(formData)`.
 * On cancel: calls `store.closeAthleteProfileForm()`.
 */
@Component({
  selector: 'lib-athlete-profile-form',
  standalone: true,
  imports: [FormsModule, SelectModule],
  templateUrl: './athlete-profile-form.component.html',
  styleUrl: './athlete-profile-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AthleteProfileFormComponent {
  readonly store = inject(athleteProfileStore);

  // ── Form state (signal-based) ──────────────────────────────────────────────
  readonly formData = signal<AthleteProfileFormData>(buildDefaultFormData());

  // ── Options exposed to template ───────────────────────────────────────────
  readonly experienceOptions: { value: TrainingExperience; label: string }[] = [
    { value: 'beginner', label: TRAINING_EXPERIENCE_LABELS.beginner },
    { value: 'intermediate', label: TRAINING_EXPERIENCE_LABELS.intermediate },
    { value: 'advanced', label: TRAINING_EXPERIENCE_LABELS.advanced },
  ];

  readonly goalOptions: { value: TrainingGoal; label: string }[] = [
    { value: 'fat_loss', label: TRAINING_GOAL_LABELS.fat_loss },
    { value: 'muscle_gain', label: TRAINING_GOAL_LABELS.muscle_gain },
    {
      value: 'body_recomposition',
      label: TRAINING_GOAL_LABELS.body_recomposition,
    },
    {
      value: 'sports_performance',
      label: TRAINING_GOAL_LABELS.sports_performance,
    },
    { value: 'maintain_weight', label: TRAINING_GOAL_LABELS.maintain_weight },
  ];

  readonly secondaryGoalOptions = computed<
    { value: TrainingGoal | ''; label: string }[]
  >(() => [
    { value: '', label: 'Ninguno' },
    ...this.goalOptions.filter(
      (option) => option.value !== this.formData().training.goal
    ),
  ]);

  readonly consistencyOptions: { value: TrainingConsistency; label: string }[] =
    [
      { value: 'low', label: TRAINING_CONSISTENCY_LABELS.low },
      { value: 'medium', label: TRAINING_CONSISTENCY_LABELS.medium },
      { value: 'high', label: TRAINING_CONSISTENCY_LABELS.high },
    ];

  readonly scheduleOptions: { value: PreferredSchedule; label: string }[] = [
    { value: 'morning', label: PREFERRED_SCHEDULE_LABELS.morning },
    { value: 'afternoon', label: PREFERRED_SCHEDULE_LABELS.afternoon },
    { value: 'evening', label: PREFERRED_SCHEDULE_LABELS.evening },
    { value: 'night', label: PREFERRED_SCHEDULE_LABELS.night },
    { value: 'flexible', label: PREFERRED_SCHEDULE_LABELS.flexible },
  ];

  readonly alcoholOptions: { value: AlcoholFrequency; label: string }[] = [
    { value: 'never', label: ALCOHOL_FREQUENCY_LABELS.never },
    { value: 'occasionally', label: ALCOHOL_FREQUENCY_LABELS.occasionally },
    { value: 'frequent', label: ALCOHOL_FREQUENCY_LABELS.frequent },
  ];

  readonly mealSlotOptions: { value: MealSlot; label: string }[] = (
    Object.entries(MEAL_SLOT_LABELS) as [MealSlot, string][]
  ).map(([value, label]) => ({ value, label }));

  readonly trainingTypeOptions = TRAINING_TYPE_OPTIONS;
  readonly sportOptions = SPORT_OPTIONS;
  readonly weekDayOptions = WEEK_DAY_OPTIONS;
  readonly sessionDurationOptions = SESSION_DURATION_OPTIONS;

  readonly trainingLocationOptions = TRAINING_LOCATION_OPTIONS;

  readonly trainingStyleOptions: {
    value: TrainingStylePreference;
    label: string;
  }[] = [
    { value: 'short', label: TRAINING_STYLE_PREFERENCE_LABELS.short },
    { value: 'balanced', label: TRAINING_STYLE_PREFERENCE_LABELS.balanced },
    { value: 'long', label: TRAINING_STYLE_PREFERENCE_LABELS.long },
  ];

  readonly muscleGroupOptions = MUSCLE_GROUP_OPTIONS;

  readonly homeEquipmentOptions = HOME_EQUIPMENT_OPTIONS;
  readonly injuryAreaOptions = INJURY_AREA_OPTIONS;
  readonly injurySeverityOptions: { value: InjurySeverity; label: string }[] = [
    { value: 'mild', label: INJURY_SEVERITY_LABELS.mild },
    { value: 'moderate', label: INJURY_SEVERITY_LABELS.moderate },
    { value: 'severe', label: INJURY_SEVERITY_LABELS.severe },
  ];

  readonly diseaseSeverityOptions: { value: DiseaseSeverity; label: string }[] =
    [
      { value: 'mild', label: DISEASE_SEVERITY_LABELS.mild },
      { value: 'moderate', label: DISEASE_SEVERITY_LABELS.moderate },
      { value: 'severe', label: DISEASE_SEVERITY_LABELS.severe },
    ];

  /**
   * True when training at home or both — shows home equipment chip selector.
   * When location is 'gym', equipment is auto-set to ['full_gym'] (no chips needed).
   */
  readonly showEquipmentSelector = computed(() => {
    const loc = this.formData().training.trainingLocation;
    return loc === 'home' || loc === 'hybrid';
  });

  /**
   * Validation error message derived from current form data.
   * Non-null value blocks the save button and shows an inline error.
   * Mirrors the validation run in saveAthleteProfile() in the store.
   */
  readonly validationError = computed(() =>
    validateAthleteProfileFormData(this.formData())
  );

  /**
   * When true the sport select shows 'Otro' and a free-text input is revealed.
   * The real stored value comes from `customSportText`.
   */
  readonly showCustomSport = signal(false);
  readonly customSportText = signal('');
  readonly #loadedProfile = signal<AthleteProfile | null | undefined>(
    undefined
  );

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  readonly #syncExistingProfile = effect(() => {
    const existing = this.store.athleteProfile();
    if (!existing || this.#loadedProfile() === existing) return;

    this.#loadedProfile.set(existing);

    const t = existing.training as AthleteProfile['training'];
    const isCustomSport =
      !!t.sport && !SPORT_OPTIONS.some((option) => option.value === t.sport);
    this.showCustomSport.set(isCustomSport);
    this.customSportText.set(isCustomSport ? t.sport : '');

    this.formData.set({
      training: {
        sport: isCustomSport ? 'other' : t.sport || '',
        trainingExperience: t.trainingExperience ?? 'beginner',
        trainingType: t.trainingType ?? 'strength',
        goal: t.goal ?? 'maintain_weight',
        availableDays: [...(t.availableDays ?? [])],
        preferredSchedule: t.preferredSchedule ?? 'morning',
        sessionDuration: t.sessionDuration ?? 60,
        trainingConsistency: t.trainingConsistency ?? 'medium',
        availableEquipment: [...(t.availableEquipment ?? [])],
        // New optional fields — fallback to defaults for backward compat
        trainingLocation: t.trainingLocation ?? 'gym',
        trainingStylePreference: t.trainingStylePreference ?? 'balanced',
        ...(t.monthsTraining != null
          ? { monthsTraining: t.monthsTraining }
          : {}),
        ...(t.secondaryGoal ? { secondaryGoal: t.secondaryGoal } : {}),
        priorityMuscles: [...(t.priorityMuscles ?? [])],
        avoidMuscles: [...(t.avoidMuscles ?? [])],
      },
      nutrition: {
        ...existing.nutrition,
        mealSchedule: [...existing.nutrition.mealSchedule],
      },
      health: {
        ...existing.health,
        injuries:
          existing.health.injuries && existing.health.injuries.length > 0
            ? existing.health.injuries.map((injury) => ({
                area: injury.area,
                severity: injury.severity,
                notes: injury.notes ?? '',
              }))
            : existing.health.hasInjury
            ? [
                {
                  notes: existing.health.injuryDescription ?? '',
                  ...(existing.health.injurySeverity
                    ? { severity: existing.health.injurySeverity }
                    : {}),
                },
              ]
            : [],
        conditions:
              existing.health.conditions && existing.health.conditions.length > 0
            ? existing.health.conditions.map((condition) => ({
                type: condition.type,
                name:
                  condition.name ??
                  (condition.type
                    ? MEDICAL_CONDITION_LABELS[condition.type]
                    : undefined) ??
                  '',
                severity: condition.severity,
                notes: condition.notes ?? '',
              }))
            : existing.health.hasDisease
            ? [
                {
                  type: 'other',
                  name: existing.health.diseaseDescription ?? '',
                  notes: '',
                  ...(existing.health.diseaseSeverity
                    ? { severity: existing.health.diseaseSeverity }
                    : {}),
                },
              ]
            : [],
      },
      lifestyle: { ...existing.lifestyle },
    });
  });

  // ── Field helpers ─────────────────────────────────────────────────────────

  onSportChange(value: string): void {
    const isOther = value === 'other';
    this.showCustomSport.set(isOther);
    if (!isOther) this.customSportText.set('');
    this.updateTraining('sport', value);
  }

  updateTraining<K extends keyof AthleteProfileFormData['training']>(
    field: K,
    value: AthleteProfileFormData['training'][K]
  ): void {
    this.formData.update((prev) => ({
      ...prev,
      training: { ...prev.training, [field]: value },
    }));
  }

  updateNutrition<K extends keyof AthleteProfileFormData['nutrition']>(
    field: K,
    value: AthleteProfileFormData['nutrition'][K]
  ): void {
    this.formData.update((prev) => ({
      ...prev,
      nutrition: { ...prev.nutrition, [field]: value },
    }));
  }

  updateHealth<K extends keyof AthleteProfileFormData['health']>(
    field: K,
    value: AthleteProfileFormData['health'][K]
  ): void {
    this.formData.update((prev) => ({
      ...prev,
      health: { ...prev.health, [field]: value },
    }));
  }

  private updatePrimaryInjury(
    updater: (injury: AthleteProfileInjury) => AthleteProfileInjury
  ): void {
    this.formData.update((prev) => ({
      ...prev,
      health: {
        ...prev.health,
        injuries: [updater(prev.health.injuries?.[0] ?? buildEmptyInjury())],
      },
    }));
  }

  private updatePrimaryCondition(
    updater: (condition: AthleteProfileCondition) => AthleteProfileCondition
  ): void {
    this.formData.update((prev) => ({
      ...prev,
      health: {
        ...prev.health,
        conditions: [
          updater(prev.health.conditions?.[0] ?? buildEmptyCondition()),
        ],
      },
    }));
  }

  primaryInjury(): AthleteProfileInjury {
    return this.formData().health.injuries?.[0] ?? buildEmptyInjury();
  }

  primaryCondition(): AthleteProfileCondition {
    return this.formData().health.conditions?.[0] ?? buildEmptyCondition();
  }

  onHasInjuryChange(hasInjury: boolean): void {
    this.formData.update((prev) => ({
      ...prev,
      health: {
        ...prev.health,
        hasInjury,
        injuries: hasInjury
          ? prev.health.injuries && prev.health.injuries.length > 0
            ? prev.health.injuries
            : [
                {
                  notes: prev.health.injuryDescription,
                  ...(prev.health.injurySeverity
                    ? { severity: prev.health.injurySeverity }
                    : {}),
                },
              ]
          : [],
      },
    }));
  }

  onHasDiseaseChange(hasDisease: boolean): void {
    this.formData.update((prev) => ({
      ...prev,
      health: {
        ...prev.health,
        hasDisease,
        conditions: hasDisease
          ? prev.health.conditions && prev.health.conditions.length > 0
            ? prev.health.conditions
            : [
                {
                  type: 'other',
                  name: prev.health.diseaseDescription,
                  notes: '',
                  ...(prev.health.diseaseSeverity
                    ? { severity: prev.health.diseaseSeverity }
                    : {}),
                },
              ]
          : [],
      },
    }));
  }

  updatePrimaryInjuryArea(value: string): void {
    this.updatePrimaryInjury((injury) => ({
      ...injury,
      area: value ? (value as InjuryArea) : undefined,
    }));
  }

  updatePrimaryInjurySeverity(value: string): void {
    const severity = (value as InjurySeverity) || undefined;
    this.updatePrimaryInjury((injury) => ({
      ...injury,
      severity,
    }));
    this.updateHealth('injurySeverity', severity);
  }

  updatePrimaryInjuryNotes(value: string): void {
    this.updatePrimaryInjury((injury) => ({
      ...injury,
      notes: value,
    }));
    this.updateHealth('injuryDescription', value);
  }

  updatePrimaryConditionName(value: string): void {
    this.updatePrimaryCondition((condition) => ({
      ...condition,
      type: 'other',
      name: value,
    }));
    this.updateHealth('diseaseDescription', value);
  }

  updatePrimaryConditionSeverity(value: string): void {
    const severity = (value as DiseaseSeverity) || undefined;
    this.updatePrimaryCondition((condition) => ({
      ...condition,
      severity,
    }));
    this.updateHealth('diseaseSeverity', severity);
  }

  updatePrimaryConditionNotes(value: string): void {
    this.updatePrimaryCondition((condition) => ({
      ...condition,
      notes: value,
    }));
    this.updateHealth('diseaseDescription', value);
  }

  updateLifestyle<K extends keyof AthleteProfileFormData['lifestyle']>(
    field: K,
    value: AthleteProfileFormData['lifestyle'][K]
  ): void {
    this.formData.update((prev) => ({
      ...prev,
      lifestyle: { ...prev.lifestyle, [field]: value },
    }));
  }

  toggleMealSlot(slot: MealSlot): void {
    this.formData.update((prev) => {
      const current = prev.nutrition.mealSchedule;
      const updated = current.includes(slot)
        ? current.filter((s) => s !== slot)
        : [...current, slot];
      return {
        ...prev,
        nutrition: { ...prev.nutrition, mealSchedule: updated },
      };
    });
  }

  isMealSlotSelected(slot: MealSlot): boolean {
    return this.formData().nutrition.mealSchedule.includes(slot);
  }

  toggleAvailableDay(day: WeekDayId): void {
    this.formData.update((prev) => {
      const current = prev.training.availableDays;
      const updated = current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day];
      return {
        ...prev,
        training: { ...prev.training, availableDays: updated },
      };
    });
  }

  isDaySelected(day: WeekDayId): boolean {
    return this.formData().training.availableDays.includes(day);
  }

  toggleEquipment(value: EquipmentId): void {
    this.formData.update((prev) => {
      const current = prev.training.availableEquipment;
      const updated = current.includes(value)
        ? current.filter((e) => e !== value)
        : [...current, value];
      return {
        ...prev,
        training: { ...prev.training, availableEquipment: updated },
      };
    });
  }

  isEquipmentSelected(value: EquipmentId): boolean {
    return this.formData().training.availableEquipment.includes(value);
  }

  /**
   * Handles training location change.
   * - 'gym'  → auto-sets equipment to ['full_gym'], hides chip selector
   * - 'home' → clears gym equipment, shows home chip selector
   * - 'hybrid' → ensures 'full_gym' is included, shows home chip selector
   */
  onTrainingLocationChange(location: TrainingLocation): void {
    this.updateTraining('trainingLocation', location);

    if (location === 'gym') {
      this.updateTraining('availableEquipment', ['full_gym']);
    } else if (location === 'hybrid') {
      const current = this.formData().training.availableEquipment;
      if (!current.includes('full_gym')) {
        this.updateTraining('availableEquipment', ['full_gym', ...current]);
      }
    } else {
      // 'home' — remove full_gym since it's not available at home
      const current = this.formData().training.availableEquipment;
      this.updateTraining(
        'availableEquipment',
        current.filter((e) => e !== 'full_gym')
      );
    }
  }

  togglePriorityMuscle(value: MuscleId): void {
    this.formData.update((prev) => {
      const current = prev.training.priorityMuscles ?? [];
      const updated = current.includes(value)
        ? current.filter((m) => m !== value)
        : current.length >= MAX_PRIORITY_MUSCLES
        ? current
        : [...current, value];
      return {
        ...prev,
        training: { ...prev.training, priorityMuscles: updated },
      };
    });
  }

  isPriorityMuscleSelected(value: MuscleId): boolean {
    return (this.formData().training.priorityMuscles ?? []).includes(value);
  }

  canSelectMorePriorityMuscles(value: MuscleId): boolean {
    const current = this.formData().training.priorityMuscles ?? [];
    return current.includes(value) || current.length < MAX_PRIORITY_MUSCLES;
  }

  toggleAvoidMuscle(value: MuscleId): void {
    this.formData.update((prev) => {
      const current = prev.training.avoidMuscles ?? [];
      const updated = current.includes(value)
        ? current.filter((m) => m !== value)
        : [...current, value];
      return { ...prev, training: { ...prev.training, avoidMuscles: updated } };
    });
  }

  isAvoidMuscleSelected(value: MuscleId): boolean {
    return (this.formData().training.avoidMuscles ?? []).includes(value);
  }

  onSecondaryGoalChange(value: string): void {
    // Empty string means "no secondary goal" — store as undefined
    this.updateTraining('secondaryGoal', (value as TrainingGoal) || undefined);
  }

  onMonthsTrainingChange(raw: string): void {
    this.updateTraining('monthsTraining', raw ? +raw : undefined);
  }

  // ── Submit / Cancel ────────────────────────────────────────────────────────

  async onSubmit(): Promise<void> {
    const data = this.formData();
    // When 'Otro' is selected for sport, persist the custom text entered
    const finalSport =
      data.training.sport === 'other'
        ? this.customSportText().trim()
        : data.training.sport;

    await this.store.saveAthleteProfile({
      ...data,
      training: { ...data.training, sport: finalSport },
      health: {
        ...data.health,
        injuries: data.health.hasInjury ? data.health.injuries ?? [] : [],
        conditions: data.health.hasDisease ? data.health.conditions ?? [] : [],
        injuryDescription: this.primaryInjury().notes.trim(),
        injurySeverity: this.primaryInjury().severity,
        diseaseDescription: this.primaryCondition().name?.trim() ?? '',
        diseaseSeverity: this.primaryCondition().severity,
      },
    });
  }

  onCancel(): void {
    this.store.closeAthleteProfileForm();
  }
}
