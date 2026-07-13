import { AIRoutineCoachResponseValidator } from './ai-routine-coach-response.validator';
import type { AIRoutineCoachResponse } from '../models/ai-routine-coach-response.model';

describe('AIRoutineCoachResponseValidator', () => {
  it('accepts a valid routine coach response shape', () => {
    const response: AIRoutineCoachResponse = {
      summary: 'Good routine fit.',
      adaptations: [],
      warnings: [],
      coachNotes: [],
      confidence: 0.8,
      exerciseChanges: [],
      volumeChanges: [],
      equipmentChanges: [],
      reviewRequired: false,
    };

    const result = new AIRoutineCoachResponseValidator().validate(response);

    expect(result).toEqual({ valid: true, errors: [] });
  });

  it('rejects invalid routine coach response shapes', () => {
    const result = new AIRoutineCoachResponseValidator().validate({
      summary: 123,
      adaptations: [],
      warnings: [],
      coachNotes: [],
      confidence: 2,
      exerciseChanges: [{ action: 'replace', exerciseId: 5, reason: null }],
      volumeChanges: [{ target: 'exercise', targetId: 4, action: 'down' }],
      equipmentChanges: [{ action: 'replace', equipmentId: 2, reason: null }],
      reviewRequired: 'no',
    });

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
