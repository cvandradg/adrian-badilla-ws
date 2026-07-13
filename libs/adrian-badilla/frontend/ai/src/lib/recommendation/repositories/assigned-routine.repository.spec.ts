import { TestBed } from '@angular/core/testing';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  writeBatch,
  where,
} from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';
import { AssignedRoutineRepository } from './assigned-routine.repository';
import {
  createExercise,
  createRoutineTemplate,
} from '../testing/routine-recommendation.fixtures';
import type { RoutineRecommendationResult } from '../models/routine-recommendation-result.model';

const batchMock = {
  update: jest.fn(),
  set: jest.fn(),
  commit: jest.fn(),
};

jest.mock('@angular/fire/firestore', () => ({
  Firestore: class Firestore {},
  collection: jest.fn((...args: unknown[]) => {
    const segments = args.slice(1).map(String);
    return { path: segments.join('/') };
  }),
  doc: jest.fn((parentOrDb: unknown, ...segments: string[]) => {
    if (segments.length > 0) {
      return {
        id: segments[segments.length - 1],
        path: segments.join('/'),
      };
    }

    const parentPath =
      typeof parentOrDb === 'object' &&
      parentOrDb !== null &&
      'path' in parentOrDb &&
      typeof parentOrDb.path === 'string'
        ? parentOrDb.path
        : '';

    return {
      id: 'generated-doc-id',
      path: parentPath ? `${parentPath}/generated-doc-id` : 'generated-doc-id',
    };
  }),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  limit: jest.fn(() => ({ kind: 'limit' })),
  orderBy: jest.fn(() => ({ kind: 'orderBy' })),
  query: jest.fn(() => ({ kind: 'query' })),
  serverTimestamp: jest.fn(() => 'SERVER_TIMESTAMP'),
  writeBatch: jest.fn(() => batchMock),
  where: jest.fn(() => ({ kind: 'where' })),
}));

describe('AssignedRoutineRepository', () => {
  let repository: AssignedRoutineRepository;
  const mockedGetDoc = jest.mocked(getDoc);
  const mockedGetDocs = jest.mocked(getDocs);
  const mockedServerTimestamp = jest.mocked(serverTimestamp);
  const mockedWriteBatch = jest.mocked(writeBatch);

  const routineTemplate = createRoutineTemplate({ id: 'routine-1' });

  const recommendation: RoutineRecommendationResult = {
    routineId: 'routine-1',
    routineTemplate,
    score: 120,
    normalizedScore: 100,
    rank: 1,
    reasons: [{ code: 'goal_match', label: 'Goal matches', points: 40 }],
    warnings: [],
    penalties: [],
    requiredAdaptations: [],
    candidate: {
      id: 'candidate-1',
      routineTemplate,
      resolvedExercises: [
        {
          dayId: 'day-1',
          dayName: 'Day 1',
          slot: routineTemplate.days[0].exercises[0],
          exercise: createExercise({
            id: 'exercise-1',
            name: 'Bench Press',
            thumbnailUrl: 'thumb.jpg',
          }),
        },
      ],
      missingExercises: [],
      estimatedSessionDuration: 8,
      estimatedWeeklyDays: 1,
      goal: 'muscle_gain',
      trainingLocation: 'gym',
      requiredEquipment: ['bench', 'barbell'],
      matchedEquipment: ['bench', 'barbell'],
      missingEquipment: [],
      primaryWorkedMuscles: ['chest'],
      secondaryWorkedMuscles: ['triceps', 'shoulders'],
      stabilizerWorkedMuscles: ['core'],
      musclesWorked: ['chest', 'triceps', 'shoulders', 'core'],
      priorityMusclesWorked: ['chest'],
      contraindicatedExercises: [],
      compatibleWithEquipment: true,
      compatibleWithLocation: true,
      compatibleWithSchedule: true,
      warnings: [],
      metadata: {
        totalExercises: 1,
        resolvedExerciseCount: 1,
        missingExerciseCount: 0,
        contraindicationCount: 0,
        locationMatched: true,
        equipmentMatchedCount: 2,
        missingEquipmentCount: 0,
        userGoalMatched: true,
      },
    },
  };

  function createQueryDoc<T>(id: string, data: T) {
    return {
      id,
      ref: { id, path: id },
      data: () => data,
    };
  }

  beforeEach(() => {
    batchMock.update.mockReset();
    batchMock.set.mockReset();
    batchMock.commit.mockReset();
    mockedGetDoc.mockReset();
    mockedGetDocs.mockReset();
    mockedServerTimestamp.mockReset();
    mockedWriteBatch.mockClear();

    mockedServerTimestamp.mockReturnValue('SERVER_TIMESTAMP' as never);
    batchMock.commit.mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      providers: [
        AssignedRoutineRepository,
        { provide: Firestore, useValue: {} },
      ],
    });

    repository = TestBed.inject(AssignedRoutineRepository);
  });

  it('deactivates previous active routines and clones root days and exercises', async () => {
    mockedGetDocs.mockResolvedValue({
      docs: [{ ref: { id: 'previous-1' } }, { ref: { id: 'previous-2' } }],
    } as never);

    const assignmentId = await firstValueFrom(
      repository.assignTopRecommendation('uid', recommendation)
    );

    expect(assignmentId).toBe('generated-doc-id');
    expect(batchMock.update).toHaveBeenCalledTimes(2);
    expect(batchMock.set).toHaveBeenCalledTimes(3);
    expect(batchMock.commit).toHaveBeenCalledTimes(1);

    const rootWrite = batchMock.set.mock.calls.find(
      ([ref]) => ref.path === 'users/uid/assigned-routines/generated-doc-id'
    );
    const dayWrite = batchMock.set.mock.calls.find(
      ([ref]) =>
        ref.path === 'users/uid/assigned-routines/generated-doc-id/days/day-1'
    );
    const exerciseWrite = batchMock.set.mock.calls.find(
      ([ref]) =>
        ref.path ===
        'users/uid/assigned-routines/generated-doc-id/days/day-1/exercises/generated-doc-id'
    );

    expect(rootWrite?.[1]).toMatchObject({
      routineTemplateId: 'routine-1',
      source: 'recommendation_engine',
      recommendationScore: 120,
      normalizedScore: 100,
      recommendationReasons: recommendation.reasons,
      status: 'active',
    });
    expect(dayWrite?.[1]).toMatchObject({
      dayId: 'day-1',
      dayName: 'Day 1',
      order: 0,
      exerciseCount: 1,
    });
    expect(exerciseWrite?.[1]).toMatchObject({
      originalExerciseId: 'exercise-1',
      exerciseId: 'exercise-1',
      nameSnapshot: 'Bench Press',
      thumbnailUrlSnapshot: 'thumb.jpg',
      status: 'pending',
    });
  });

  it('returns the active assigned routine with hydrated subcollections', async () => {
    mockedGetDocs
      .mockResolvedValueOnce({
        docs: [
          createQueryDoc('assignment-1', {
            userId: 'uid',
            routineTemplateId: 'routine-1',
            source: 'recommendation_engine',
            recommendationScore: 120,
            normalizedScore: 100,
            recommendationReasons: [],
            warnings: [],
            penalties: [],
            requiredAdaptations: [],
            status: 'active',
            assignedAt: 'ASSIGNED_AT',
            startedAt: null,
            completedAt: null,
            templateSnapshot: routineTemplate,
            updatedAt: 'UPDATED_AT',
            deactivatedAt: null,
          }),
        ],
      } as never)
      .mockResolvedValueOnce({
        docs: [
          createQueryDoc('day-1', {
            dayId: 'day-1',
            dayName: 'Day 1',
            order: 0,
            estimatedDuration: 8,
            exerciseCount: 1,
          }),
        ],
      } as never)
      .mockResolvedValueOnce({
        docs: [
          createQueryDoc('assigned-exercise-1', {
            originalExerciseId: 'exercise-1',
            exerciseId: 'exercise-1',
            nameSnapshot: 'Bench Press',
            thumbnailUrlSnapshot: 'thumb.jpg',
            order: 0,
            sets: 4,
            repsMin: 8,
            repsMax: 10,
            restSeconds: 90,
            rir: 2,
            tempo: '2-0-2-0',
            notes: '',
            status: 'pending',
          }),
        ],
      } as never);

    const result = await firstValueFrom(
      repository.getActiveAssignedRoutine('uid')
    );

    expect(result?.id).toBe('assignment-1');
    expect(result?.status).toBe('active');
    expect(result?.days).toHaveLength(1);
    expect(result?.days[0]?.exercises[0]?.nameSnapshot).toBe('Bench Press');
  });

  it('returns an assigned routine by id with hydrated subcollections', async () => {
    mockedGetDoc.mockResolvedValue({
      exists: () => true,
      id: 'assignment-1',
      data: () => ({
        userId: 'uid',
        routineTemplateId: 'routine-1',
        source: 'recommendation_engine',
        recommendationScore: 120,
        normalizedScore: 100,
        recommendationReasons: [],
        warnings: [],
        penalties: [],
        requiredAdaptations: [],
        status: 'active',
        assignedAt: 'ASSIGNED_AT',
        startedAt: null,
        completedAt: null,
        templateSnapshot: routineTemplate,
        updatedAt: 'UPDATED_AT',
        deactivatedAt: null,
      }),
    } as never);
    mockedGetDocs
      .mockResolvedValueOnce({
        docs: [
          createQueryDoc('day-1', {
            dayId: 'day-1',
            dayName: 'Day 1',
            order: 0,
            estimatedDuration: 8,
            exerciseCount: 1,
          }),
        ],
      } as never)
      .mockResolvedValueOnce({
        docs: [
          createQueryDoc('assigned-exercise-1', {
            originalExerciseId: 'exercise-1',
            exerciseId: 'exercise-1',
            nameSnapshot: 'Bench Press',
            thumbnailUrlSnapshot: 'thumb.jpg',
            order: 0,
            sets: 4,
            repsMin: 8,
            repsMax: 10,
            restSeconds: 90,
            rir: 2,
            tempo: '2-0-2-0',
            notes: '',
            status: 'pending',
          }),
        ],
      } as never);

    const result = await firstValueFrom(
      repository.getAssignedRoutineById('uid', 'assignment-1')
    );

    expect(result?.id).toBe('assignment-1');
    expect(result?.templateSnapshot.id).toBe('routine-1');
    expect(result?.days[0]?.id).toBe('day-1');
  });
});
