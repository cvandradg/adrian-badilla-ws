import type { AIUserContextSource } from '../models/ai-user-context.model';

export function createAIUserContextSource(
  overrides: Partial<AIUserContextSource> = {}
): AIUserContextSource {
  return {
    uid: 'uid',
    displayName: 'Ladron de Arroz',
    healthProfile: {
      ageYears: 30,
      heightCm: 185,
      weightKg: 90,
      bodyFatPercent: 18,
      bmi: 26.3,
      bmiCategory: 'overweight',
      isComplete: true,
    },
    athleteProfile: {
      completed: true,
      completedAt: null,
      updatedAt: null,
      training: {
        sport: 'Baloncesto',
        trainingExperience: 'beginner',
        trainingType: 'Fuerza',
        goal: 'gain muscle',
        secondaryGoal: 'lose fat',
        availableDays: ['lunes', 'wednesday', 'thursday', 'friday'],
        preferredSchedule: 'morning',
        sessionDuration: 60,
        trainingConsistency: 'medium',
        availableEquipment: ['full gym'],
        trainingLocation: 'gym',
        trainingStylePreference: 'long',
        monthsTraining: 8,
        priorityMuscles: ['Pecho', 'Espalda'],
        avoidMuscles: ['Abs'],
      },
      nutrition: {
        followsDiet: true,
        mealSchedule: ['Desayuno', 'almuerzo', 'post workout'],
        foodIntolerances: 'Lactosa',
      },
      health: {
        hasDisease: false,
        diseaseDescription: '',
        hasInjury: false,
        injuryDescription: '',
      },
      lifestyle: {
        profession: 'Developer',
        smoker: false,
        alcohol: 'occasionally',
      },
    },
    ...overrides,
  };
}
