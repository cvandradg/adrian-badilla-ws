import { AIUserContextBuilder } from './ai-user-context.builder';
import { createAIUserContextSource } from '../testing/ai-user-context.fixtures';

describe('AIUserContextBuilder', () => {
  const builder = new AIUserContextBuilder();

  it('builds a user with complete health profile', () => {
    const result = builder.build(createAIUserContextSource());

    expect(result.healthProfile.bmi).toBe(26.3);
    expect(result.healthProfile.bmiCategory).toBe('overweight');
    expect(result.readiness.isHealthProfileComplete).toBe(true);
  });

  it('builds a user with complete athlete profile', () => {
    const result = builder.build(createAIUserContextSource());

    expect(result.readiness.isAthleteProfileComplete).toBe(true);
    expect(result.athleteProfile.goal).toBe('muscle_gain');
    expect(result.athleteProfile.trainingType).toBe('strength');
  });

  it('normalizes legacy free-text values', () => {
    const result = builder.build(
      createAIUserContextSource({
        athleteProfile: {
          completed: true,
          completedAt: null,
          updatedAt: null,
          training: {
            sport: 'Baloncesto',
            trainingExperience: 'Principiante',
            trainingType: 'Fuerza',
            goal: 'ganar masa',
            secondaryGoal: 'bajar grasa',
            availableDays: ['Lunes', 'Miércoles'],
            preferredSchedule: 'Mediodía',
            sessionDuration: 45,
            trainingConsistency: 'Media',
            availableEquipment: ['gimnasio completo'],
            trainingLocation: 'Ambos',
            trainingStylePreference: 'Moderados',
            priorityMuscles: ['Brazos', 'Piernas'],
            avoidMuscles: ['Abdomen'],
          },
          nutrition: {
            followsDiet: true,
            mealSchedule: ['media mañana', 'Cena'],
            foodIntolerances: '',
          },
          health: {
            hasDisease: true,
            diseaseDescription: 'Asma',
            diseaseSeverity: 'Leve',
            hasInjury: true,
            injuryDescription: 'Hombro',
            injurySeverity: 'minor',
          },
          lifestyle: {
            profession: '',
            smoker: false,
            alcohol: 'never',
          },
        },
      })
    );

    expect(result.athleteProfile.goal).toBe('muscle_gain');
    expect(result.athleteProfile.secondaryGoal).toBe('fat_loss');
    expect(result.athleteProfile.trainingLocation).toBe('hybrid');
    expect(result.athleteProfile.preferredSchedule).toBe('afternoon');
    expect(result.athleteProfile.trainingStylePreference).toBe('balanced');
    expect(result.athleteProfile.availableEquipment).toEqual(['full_gym']);
    expect(result.athleteProfile.priorityMuscles).toEqual(
      expect.arrayContaining(['biceps', 'triceps', 'quadriceps'])
    );
    expect(result.healthRestrictions.diseaseSeverity).toBe('mild');
    expect(result.healthRestrictions.injurySeverity).toBe('mild');
    expect(result.nutritionProfile.mealSchedule).toEqual(
      expect.arrayContaining(['snack', 'dinner'])
    );
  });

  it('keeps canonical values canonical', () => {
    const result = builder.build(
      createAIUserContextSource({
        athleteProfile: {
          completed: true,
          completedAt: null,
          updatedAt: null,
          training: {
            sport: 'basketball',
            trainingExperience: 'advanced',
            trainingType: 'strength',
            goal: 'muscle_gain',
            secondaryGoal: 'fat_loss',
            availableDays: ['monday', 'friday'],
            preferredSchedule: 'night',
            sessionDuration: 90,
            trainingConsistency: 'high',
            availableEquipment: ['full_gym'],
            trainingLocation: 'gym',
            trainingStylePreference: 'long',
            monthsTraining: 48,
            priorityMuscles: ['chest', 'back'],
            avoidMuscles: ['core'],
          },
          nutrition: {
            followsDiet: true,
            mealSchedule: ['breakfast', 'lunch'],
            foodIntolerances: '',
          },
          health: {
            hasDisease: false,
            diseaseDescription: '',
            hasInjury: false,
            injuryDescription: '',
          },
          lifestyle: {
            profession: '',
            smoker: false,
            alcohol: 'never',
          },
        },
      })
    );

    expect(result.athleteProfile.goal).toBe('muscle_gain');
    expect(result.athleteProfile.sport).toBe('basketball');
    expect(result.metrics.trainingAgeCategory).toBe('advanced');
  });

  it('keeps workout readiness false for severe injury', () => {
    const result = builder.build(
      createAIUserContextSource({
        athleteProfile: {
          ...createAIUserContextSource().athleteProfile!,
          health: {
            hasDisease: false,
            diseaseDescription: '',
            hasInjury: true,
            injuryDescription: 'Rodilla',
            injurySeverity: 'severe',
          },
        },
      })
    );

    expect(result.healthRestrictions.injurySeverity).toBe('severe');
    expect(result.readiness.isWorkoutRecommendationReady).toBe(false);
  });

  it('keeps diet readiness false for severe disease', () => {
    const result = builder.build(
      createAIUserContextSource({
        athleteProfile: {
          ...createAIUserContextSource().athleteProfile!,
          health: {
            hasDisease: true,
            diseaseDescription: 'Diabetes',
            diseaseSeverity: 'severe',
            hasInjury: false,
            injuryDescription: '',
          },
        },
      })
    );

    expect(result.healthRestrictions.diseaseSeverity).toBe('severe');
    expect(result.readiness.isDietRecommendationReady).toBe(false);
  });

  it('handles missing body fat percent', () => {
    const result = builder.build(
      createAIUserContextSource({
        healthProfile: {
          ageYears: 30,
          heightCm: 185,
          weightKg: 90,
          bodyFatPercent: null,
          bmi: 26.3,
          bmiCategory: 'overweight',
        },
      })
    );

    expect(result.healthProfile.bodyFatPercent).toBeNull();
    expect(result.metrics.leanBodyMassKg).toBeNull();
    expect(result.metrics.fatMassKg).toBeNull();
  });

  it('normalizes home users', () => {
    const result = builder.build(
      createAIUserContextSource({
        athleteProfile: {
          ...createAIUserContextSource().athleteProfile!,
          training: {
            ...createAIUserContextSource().athleteProfile!.training,
            trainingLocation: 'home',
            availableEquipment: ['mancuernas', 'bandas'],
          },
        },
      })
    );

    expect(result.athleteProfile.trainingLocation).toBe('home');
    expect(result.athleteProfile.availableEquipment).toEqual(
      expect.arrayContaining(['dumbbells', 'resistance_bands'])
    );
  });

  it('normalizes gym users with full_gym', () => {
    const result = builder.build(
      createAIUserContextSource({
        athleteProfile: {
          ...createAIUserContextSource().athleteProfile!,
          training: {
            ...createAIUserContextSource().athleteProfile!.training,
            trainingLocation: 'gym',
            availableEquipment: ['mancuernas'],
          },
        },
      })
    );

    expect(result.athleteProfile.trainingLocation).toBe('gym');
    expect(result.athleteProfile.availableEquipment).toEqual(['full_gym']);
  });

  it('categorizes beginner users from monthsTraining', () => {
    const result = builder.build(
      createAIUserContextSource({
        athleteProfile: {
          ...createAIUserContextSource().athleteProfile!,
          training: {
            ...createAIUserContextSource().athleteProfile!.training,
            trainingExperience: 'beginner',
            monthsTraining: 6,
          },
        },
      })
    );

    expect(result.metrics.trainingAgeCategory).toBe('beginner');
  });

  it('categorizes advanced users from monthsTraining', () => {
    const result = builder.build(
      createAIUserContextSource({
        athleteProfile: {
          ...createAIUserContextSource().athleteProfile!,
          training: {
            ...createAIUserContextSource().athleteProfile!.training,
            trainingExperience: 'advanced',
            monthsTraining: 60,
          },
        },
      })
    );

    expect(result.metrics.trainingAgeCategory).toBe('advanced');
  });
});
