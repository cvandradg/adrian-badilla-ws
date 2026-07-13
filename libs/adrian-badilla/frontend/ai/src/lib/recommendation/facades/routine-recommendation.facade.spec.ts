import { TestBed } from '@angular/core/testing';
import { Firestore, collectionData, docData } from '@angular/fire/firestore';
import { firstValueFrom, of } from 'rxjs';
import { RoutineRecommendationFacade } from './routine-recommendation.facade';
import {
  createExercise,
  createRoutineTemplate,
} from '../testing/routine-recommendation.fixtures';

jest.mock('@angular/fire/firestore', () => {
  return {
    Firestore: class Firestore {},
    collection: jest.fn(() => ({})),
    collectionData: jest.fn(),
    doc: jest.fn(() => ({})),
    docData: jest.fn(),
    orderBy: jest.fn(() => ({})),
    query: jest.fn(() => ({})),
    where: jest.fn(() => ({})),
  };
});

describe('RoutineRecommendationFacade', () => {
  let facade: RoutineRecommendationFacade;
  const mockedCollectionData = jest.mocked(collectionData);
  const mockedDocData = jest.mocked(docData);

  beforeEach(() => {
    mockedCollectionData.mockReset();
    mockedDocData.mockReset();

    TestBed.configureTestingModule({
      providers: [
        RoutineRecommendationFacade,
        { provide: Firestore, useValue: {} },
      ],
    });

    facade = TestBed.inject(RoutineRecommendationFacade);
  });

  it('builds sorted routine recommendations for a user', async () => {
    mockedDocData.mockReturnValue(
      of({
        uid: 'uid',
        displayName: 'User',
        healthProfile: {
          ageYears: 30,
          heightCm: 180,
          weightKg: 80,
          bodyFatPercent: 18,
          bmi: 24.7,
          bmiCategory: 'normal',
        },
        athleteProfile: {
          completed: true,
          completedAt: null,
          updatedAt: null,
          training: {
            sport: 'basketball',
            trainingExperience: 'beginner',
            trainingType: 'strength',
            goal: 'muscle_gain',
            availableDays: ['monday', 'wednesday', 'friday'],
            preferredSchedule: 'morning',
            sessionDuration: 60,
            trainingConsistency: 'medium',
            availableEquipment: ['full_gym'],
            trainingLocation: 'gym',
            trainingStylePreference: 'balanced',
            monthsTraining: 6,
            priorityMuscles: ['chest'],
            avoidMuscles: [],
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
    mockedCollectionData
      .mockReturnValueOnce(
        of([
          createRoutineTemplate({ id: 'best-routine', goals: ['muscle_gain'] }),
          createRoutineTemplate({ id: 'second-routine', goals: ['fat_loss'] }),
        ])
      )
      .mockReturnValueOnce(of([createExercise()]));

    const results = await firstValueFrom(
      facade.getRoutineRecommendationsForUser('uid')
    );

    expect(results).toHaveLength(2);
    expect(results[0].rank).toBe(1);
    expect(results[1].rank).toBe(2);
    expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
  });

  it('returns the top recommendation only', async () => {
    mockedDocData.mockReturnValue(
      of({
        uid: 'uid',
        displayName: 'User',
        healthProfile: {
          ageYears: 30,
          heightCm: 180,
          weightKg: 80,
          bodyFatPercent: 18,
          bmi: 24.7,
          bmiCategory: 'normal',
        },
        athleteProfile: {
          completed: true,
          completedAt: null,
          updatedAt: null,
          training: {
            sport: 'basketball',
            trainingExperience: 'beginner',
            trainingType: 'strength',
            goal: 'muscle_gain',
            availableDays: ['monday', 'wednesday', 'friday'],
            preferredSchedule: 'morning',
            sessionDuration: 60,
            trainingConsistency: 'medium',
            availableEquipment: ['full_gym'],
            trainingLocation: 'gym',
            trainingStylePreference: 'balanced',
            monthsTraining: 6,
            priorityMuscles: ['chest'],
            avoidMuscles: [],
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
    mockedCollectionData
      .mockReturnValueOnce(of([createRoutineTemplate({ id: 'top-routine' })]))
      .mockReturnValueOnce(of([createExercise()]));

    const result = await firstValueFrom(
      facade.getTopRoutineRecommendationForUser('uid')
    );

    expect(result?.routineId).toBe('top-routine');
    expect(result?.rank).toBe(1);
  });

  it('loads only active templates and required exercises', async () => {
    mockedDocData.mockReturnValue(
      of({
        uid: 'uid',
        displayName: 'User',
        healthProfile: {
          ageYears: 30,
          heightCm: 180,
          weightKg: 80,
          bodyFatPercent: 18,
          bmi: 24.7,
          bmiCategory: 'normal',
        },
        athleteProfile: {
          completed: true,
          completedAt: null,
          updatedAt: null,
          training: {
            sport: 'basketball',
            trainingExperience: 'beginner',
            trainingType: 'strength',
            goal: 'muscle_gain',
            availableDays: ['monday', 'wednesday', 'friday'],
            preferredSchedule: 'morning',
            sessionDuration: 60,
            trainingConsistency: 'medium',
            availableEquipment: ['full_gym'],
            trainingLocation: 'gym',
            trainingStylePreference: 'balanced',
            monthsTraining: 6,
            priorityMuscles: ['chest'],
            avoidMuscles: [],
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
    mockedCollectionData
      .mockReturnValueOnce(
        of([
          createRoutineTemplate({
            id: 'active-template',
            isActive: true,
            isTemplate: true,
          }),
          createRoutineTemplate({
            id: 'inactive-template',
            isActive: false,
            isTemplate: true,
          }),
        ])
      )
      .mockReturnValueOnce(
        of([
          createExercise({ id: 'exercise-1', isActive: true }),
          createExercise({ id: 'unused-exercise', isActive: true }),
        ])
      );

    const results = await firstValueFrom(
      facade.getRoutineRecommendationsForUser('uid')
    );

    expect(results).toHaveLength(1);
    expect(results[0].routineId).toBe('active-template');
    expect(results[0].candidate.resolvedExercises).toHaveLength(1);
  });
});
