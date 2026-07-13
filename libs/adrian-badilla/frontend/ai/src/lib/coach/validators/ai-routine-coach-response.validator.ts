import type {
  AIRoutineCoachResponse,
  AIRoutineCoachValidationResult,
} from '../models/ai-routine-coach-response.model';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export class AIRoutineCoachResponseValidator {
  validate(response: unknown): AIRoutineCoachValidationResult {
    if (!isObject(response)) {
      return {
        valid: false,
        errors: ['Response must be an object.'],
      };
    }

    const errors: string[] = [];

    if (typeof response['summary'] !== 'string') {
      errors.push('summary must be a string.');
    }
    if (!isStringArray(response['adaptations'])) {
      errors.push('adaptations must be an array of strings.');
    }
    if (!isStringArray(response['warnings'])) {
      errors.push('warnings must be an array of strings.');
    }
    if (!isStringArray(response['coachNotes'])) {
      errors.push('coachNotes must be an array of strings.');
    }
    if (!isFiniteNumber(response['confidence'])) {
      errors.push('confidence must be a finite number.');
    } else if (response['confidence'] < 0 || response['confidence'] > 1) {
      errors.push('confidence must be between 0 and 1.');
    }
    if (typeof response['reviewRequired'] !== 'boolean') {
      errors.push('reviewRequired must be a boolean.');
    }

    if (!Array.isArray(response['exerciseChanges'])) {
      errors.push('exerciseChanges must be an array.');
    } else {
      response['exerciseChanges'].forEach((item, index) => {
        if (!isObject(item)) {
          errors.push(`exerciseChanges[${index}] must be an object.`);
          return;
        }
        if (!['keep', 'replace', 'remove', 'add'].includes(String(item['action']))) {
          errors.push(`exerciseChanges[${index}].action is invalid.`);
        }
        if (typeof item['exerciseId'] !== 'string') {
          errors.push(`exerciseChanges[${index}].exerciseId must be a string.`);
        }
        if (
          'replacementExerciseId' in item &&
          item['replacementExerciseId'] != null &&
          typeof item['replacementExerciseId'] !== 'string'
        ) {
          errors.push(
            `exerciseChanges[${index}].replacementExerciseId must be a string.`
          );
        }
        if (typeof item['reason'] !== 'string') {
          errors.push(`exerciseChanges[${index}].reason must be a string.`);
        }
      });
    }

    if (!Array.isArray(response['volumeChanges'])) {
      errors.push('volumeChanges must be an array.');
    } else {
      response['volumeChanges'].forEach((item, index) => {
        if (!isObject(item)) {
          errors.push(`volumeChanges[${index}] must be an object.`);
          return;
        }
        if (!['routine', 'day', 'exercise'].includes(String(item['target']))) {
          errors.push(`volumeChanges[${index}].target is invalid.`);
        }
        if (typeof item['targetId'] !== 'string') {
          errors.push(`volumeChanges[${index}].targetId must be a string.`);
        }
        if (!['keep', 'increase', 'decrease'].includes(String(item['action']))) {
          errors.push(`volumeChanges[${index}].action is invalid.`);
        }
        if (
          'setsDelta' in item &&
          item['setsDelta'] != null &&
          !isFiniteNumber(item['setsDelta'])
        ) {
          errors.push(`volumeChanges[${index}].setsDelta must be a finite number.`);
        }
        if (
          'repsDelta' in item &&
          item['repsDelta'] != null &&
          !isFiniteNumber(item['repsDelta'])
        ) {
          errors.push(`volumeChanges[${index}].repsDelta must be a finite number.`);
        }
        if (typeof item['reason'] !== 'string') {
          errors.push(`volumeChanges[${index}].reason must be a string.`);
        }
      });
    }

    if (!Array.isArray(response['equipmentChanges'])) {
      errors.push('equipmentChanges must be an array.');
    } else {
      response['equipmentChanges'].forEach((item, index) => {
        if (!isObject(item)) {
          errors.push(`equipmentChanges[${index}] must be an object.`);
          return;
        }
        if (!['keep', 'replace', 'remove'].includes(String(item['action']))) {
          errors.push(`equipmentChanges[${index}].action is invalid.`);
        }
        if (typeof item['equipmentId'] !== 'string') {
          errors.push(`equipmentChanges[${index}].equipmentId must be a string.`);
        }
        if (
          'replacementEquipmentId' in item &&
          item['replacementEquipmentId'] != null &&
          typeof item['replacementEquipmentId'] !== 'string'
        ) {
          errors.push(
            `equipmentChanges[${index}].replacementEquipmentId must be a string.`
          );
        }
        if (typeof item['reason'] !== 'string') {
          errors.push(`equipmentChanges[${index}].reason must be a string.`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  isValid(response: unknown): response is AIRoutineCoachResponse {
    return this.validate(response).valid;
  }
}
