import { Injectable } from '@angular/core';
import { AIRoutineCoachContextBuilder } from '../builders/ai-routine-coach-context.builder';
import { AIRoutineCoachPromptBuilder } from '../builders/ai-routine-coach-prompt.builder';
import type {
  AIRoutineCoachContext,
  AIRoutineCoachContextBuildInput,
} from '../models/ai-routine-coach-context.model';
import type { AIRoutineCoachResponse } from '../models/ai-routine-coach-response.model';
import { AIRoutineCoachResponseValidator } from '../validators/ai-routine-coach-response.validator';

function buildEmptyResponse(): AIRoutineCoachResponse {
  return {
    summary: '',
    adaptations: [],
    warnings: [],
    coachNotes: [],
    confidence: 0,
    exerciseChanges: [],
    volumeChanges: [],
    equipmentChanges: [],
    reviewRequired: false,
  };
}

@Injectable({ providedIn: 'root' })
export class AIRoutineCoachFacade {
  readonly #contextBuilder = new AIRoutineCoachContextBuilder();
  readonly #promptBuilder = new AIRoutineCoachPromptBuilder();
  readonly #validator = new AIRoutineCoachResponseValidator();

  buildContext(input: AIRoutineCoachContextBuildInput): AIRoutineCoachContext {
    return this.#contextBuilder.build(input);
  }

  buildPrompt(context: AIRoutineCoachContext): string {
    return this.#promptBuilder.build(context);
  }

  coachRoutine(context: AIRoutineCoachContext): AIRoutineCoachResponse {
    const prompt = this.#promptBuilder.build(context);
    void prompt;

    const simulatedResponse = buildEmptyResponse();
    const validation = this.#validator.validate(simulatedResponse);

    if (!validation.valid) {
      throw new Error(
        `Invalid AI routine coach response: ${validation.errors.join(', ')}`
      );
    }

    return simulatedResponse;
  }
}
