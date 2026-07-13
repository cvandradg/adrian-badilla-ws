import { TestBed } from '@angular/core/testing';
import { AIRoutineCoachFacade } from './ai-routine-coach.facade';
import {
  createAIUserContext,
  createExercise,
  createRoutineTemplate,
} from '../../recommendation/testing/routine-recommendation.fixtures';
import { RoutineRecommendationContextBuilder } from '../../recommendation/builders/routine-recommendation-context.builder';
import { RoutineRecommendationEngine } from '../../recommendation/engines/routine-recommendation.engine';

describe('AIRoutineCoachFacade', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AIRoutineCoachFacade],
    });
  });

  it('builds prompt pipeline and returns a simulated valid response', () => {
    const facade = TestBed.inject(AIRoutineCoachFacade);
    const userContext = createAIUserContext();
    const recommendedRoutine = new RoutineRecommendationEngine().run(
      new RoutineRecommendationContextBuilder().build(
        userContext,
        [createRoutineTemplate()],
        [createExercise()]
      )
    )[0];

    const context = facade.buildContext({
      userContext,
      recommendedRoutine,
    });
    const prompt = facade.buildPrompt(context);
    const response = facade.coachRoutine(context);

    expect(prompt).toContain('Return only valid JSON');
    expect(response).toEqual({
      summary: '',
      adaptations: [],
      warnings: [],
      coachNotes: [],
      confidence: 0,
      exerciseChanges: [],
      volumeChanges: [],
      equipmentChanges: [],
      reviewRequired: false,
    });
  });
});
