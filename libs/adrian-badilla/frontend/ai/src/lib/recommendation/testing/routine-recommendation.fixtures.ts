import type { Exercise } from '@admin/exercise-library';
import type { RoutineTemplate } from '@admin/routine-builder';
import type { AIUserContext } from '../../context/models/ai-user-context.model';

const timestamp = null as never;

export function createExercise(overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: 'exercise-1',
    name: 'Bench Press',
    description: '',
    instructions: [],
    tips: [],
    commonMistakes: [],
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders'],
    stabilizerMuscles: ['core'],
    bodyRegion: '',
    movementPattern: '',
    movementPlane: '',
    exerciseCategory: '',
    exerciseType: '',
    technicalDifficulty: 'low',
    riskLevel: 'low',
    fatigueLevel: 'medium',
    requiredEquipment: ['bench', 'barbell'],
    optionalEquipment: [],
    trainingLocations: ['gym'],
    contraindications: [],
    alternativeExerciseIds: [],
    goals: ['muscle_gain'],
    tags: [],
    videoUrl: '',
    thumbnailUrl: '',
    isCompound: true,
    isUnilateral: false,
    isBodyweight: false,
    isActive: true,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
}

export function createRoutineTemplate(
  overrides: Partial<RoutineTemplate> = {}
): RoutineTemplate {
  return {
    id: 'routine-1',
    name: 'Push Pull',
    description: '',
    difficulty: 'beginner',
    daysPerWeek: 2,
    goals: ['muscle_gain'],
    tags: [],
    trainingLocations: ['gym'],
    days: [
      {
        dayId: 'day-1',
        name: 'Day 1',
        order: 0,
        exercises: [
          {
            exId: 'slot-1',
            exerciseId: 'exercise-1',
            order: 0,
            sets: 4,
            repsMin: 8,
            repsMax: 10,
            restSeconds: 90,
            tempo: '2-0-2-0',
            rir: 2,
            notes: '',
          },
        ],
      },
    ],
    isActive: true,
    isTemplate: true,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
}

export function createAIUserContext(
  overrides: Partial<AIUserContext> = {}
): AIUserContext {
  return {
    userId: 'uid',
    displayName: 'User',
    healthProfile: {
      ageYears: 30,
      heightCm: 180,
      weightKg: 80,
      bodyFatPercent: 18,
      bmi: 24.7,
      bmiCategory: 'normal',
      gender: null,
    },
    athleteProfile: {
      goal: 'muscle_gain',
      secondaryGoal: 'fat_loss',
      trainingExperience: 'beginner',
      monthsTraining: 6,
      trainingLocation: 'gym',
      availableDays: ['monday', 'wednesday', 'friday'],
      sessionDuration: 60,
      availableEquipment: ['full_gym'],
      priorityMuscles: ['chest', 'back'],
      avoidMuscles: [],
      trainingType: 'strength',
      trainingStylePreference: 'balanced',
      preferredSchedule: 'morning',
      trainingConsistency: 'medium',
      sport: 'basketball',
    },
    healthRestrictions: {
      hasDisease: false,
      diseaseDescription: '',
      diseaseSeverity: null,
      hasInjury: false,
      injuryDescription: '',
      injurySeverity: null,
    },
    nutritionProfile: {
      followsDiet: true,
      mealSchedule: ['breakfast', 'lunch'],
      foodIntolerances: '',
    },
    preferences: {
      preferredWorkoutDays: ['monday', 'wednesday', 'friday'],
      preferredSchedule: 'morning',
      trainingLocation: 'gym',
      availableEquipment: ['full_gym'],
    },
    metrics: {
      bmiScore: 90,
      bmiCategory: 'normal',
      idealWeightKg: 71.3,
      leanBodyMassKg: 65.6,
      fatMassKg: 14.4,
      calorieEstimate: 2600,
      trainingAgeCategory: 'beginner',
    },
    readiness: {
      isHealthProfileComplete: true,
      isAthleteProfileComplete: true,
      isNutritionProfileComplete: true,
      isWorkoutRecommendationReady: true,
      isDietRecommendationReady: true,
      missingFields: [],
    },
    ...overrides,
  };
}
