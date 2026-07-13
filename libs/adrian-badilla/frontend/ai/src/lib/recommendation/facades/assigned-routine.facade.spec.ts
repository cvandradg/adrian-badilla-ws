import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { AssignedRoutineFacade } from './assigned-routine.facade';
import type { AssignedRoutine } from '../models/assigned-routine.model';
import { AssignedRoutineRepository } from '../repositories/assigned-routine.repository';
import { RoutineRecommendationFacade } from './routine-recommendation.facade';
import { createRoutineTemplate } from '../testing/routine-recommendation.fixtures';
import type { RoutineRecommendationResult } from '../models/routine-recommendation-result.model';

jest.mock('./routine-recommendation.facade', () => ({
  RoutineRecommendationFacade: class RoutineRecommendationFacade {},
}));

jest.mock('../repositories/assigned-routine.repository', () => ({
  AssignedRoutineRepository: class AssignedRoutineRepository {},
}));

describe('AssignedRoutineFacade', () => {
  const recommendation: RoutineRecommendationResult = {
    routineId: 'routine-1',
    routineTemplate: createRoutineTemplate({ id: 'routine-1' }),
    score: 120,
    normalizedScore: 100,
    rank: 1,
    reasons: [{ code: 'goal_match', label: 'Goal matches', points: 40 }],
    warnings: [],
    penalties: [],
    requiredAdaptations: [],
    candidate: {} as never,
  };

  const assignedRoutine: AssignedRoutine = {
    id: 'assignment-1',
    userId: 'uid',
    routineTemplateId: 'routine-1',
    source: 'recommendation_engine',
    recommendationScore: 120,
    normalizedScore: 100,
    recommendationReasons: [
      { code: 'goal_match', label: 'Goal matches', points: 40 },
    ],
    warnings: [],
    penalties: [],
    requiredAdaptations: [],
    status: 'active',
    assignedAt: 'ASSIGNED_AT' as never,
    startedAt: null,
    completedAt: null,
    templateSnapshot: createRoutineTemplate({ id: 'routine-1' }),
    days: [],
    updatedAt: 'UPDATED_AT' as never,
    deactivatedAt: null,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AssignedRoutineFacade,
        {
          provide: RoutineRecommendationFacade,
          useValue: {
            getTopRoutineRecommendationForUser: jest.fn(),
          },
        },
        {
          provide: AssignedRoutineRepository,
          useValue: {
            assignTopRecommendation: jest.fn(),
            getAssignedRoutineById: jest.fn(),
            getActiveAssignedRoutine: jest.fn(),
          },
        },
      ],
    });
  });

  it('assigns the top recommendation to the user', async () => {
    const routineRecommendationFacade = TestBed.inject(
      RoutineRecommendationFacade
    ) as jest.Mocked<RoutineRecommendationFacade>;
    const repository = TestBed.inject(
      AssignedRoutineRepository
    ) as jest.Mocked<AssignedRoutineRepository>;
    const facade = TestBed.inject(AssignedRoutineFacade);

    routineRecommendationFacade.getTopRoutineRecommendationForUser.mockReturnValue(
      of(recommendation)
    );
    repository.assignTopRecommendation.mockReturnValue(of('assignment-1'));
    repository.getAssignedRoutineById.mockReturnValue(of(assignedRoutine));

    const result = await firstValueFrom(
      facade.assignTopRecommendedRoutineToUser('uid')
    );

    expect(repository.assignTopRecommendation).toHaveBeenCalledWith(
      'uid',
      recommendation
    );
    expect(result?.id).toBe('assignment-1');
  });

  it('returns null when no recommendation is available', async () => {
    const routineRecommendationFacade = TestBed.inject(
      RoutineRecommendationFacade
    ) as jest.Mocked<RoutineRecommendationFacade>;
    const repository = TestBed.inject(
      AssignedRoutineRepository
    ) as jest.Mocked<AssignedRoutineRepository>;
    const facade = TestBed.inject(AssignedRoutineFacade);

    routineRecommendationFacade.getTopRoutineRecommendationForUser.mockReturnValue(
      of(null)
    );

    const result = await firstValueFrom(
      facade.assignTopRecommendedRoutineToUser('uid')
    );

    expect(result).toBeNull();
    expect(repository.assignTopRecommendation).not.toHaveBeenCalled();
  });

  it('returns the active assigned routine', async () => {
    const repository = TestBed.inject(
      AssignedRoutineRepository
    ) as jest.Mocked<AssignedRoutineRepository>;
    const facade = TestBed.inject(AssignedRoutineFacade);

    repository.getActiveAssignedRoutine.mockReturnValue(of(assignedRoutine));

    const result = await firstValueFrom(facade.getActiveAssignedRoutine('uid'));

    expect(result?.id).toBe('assignment-1');
  });
});
