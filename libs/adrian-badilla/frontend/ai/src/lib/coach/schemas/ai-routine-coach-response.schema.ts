export const AI_ROUTINE_COACH_RESPONSE_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'AIRoutineCoachResponse',
  type: 'object',
  additionalProperties: false,
  required: [
    'summary',
    'adaptations',
    'warnings',
    'coachNotes',
    'confidence',
    'exerciseChanges',
    'volumeChanges',
    'equipmentChanges',
    'reviewRequired',
  ],
  properties: {
    summary: { type: 'string' },
    adaptations: {
      type: 'array',
      items: { type: 'string' },
    },
    warnings: {
      type: 'array',
      items: { type: 'string' },
    },
    coachNotes: {
      type: 'array',
      items: { type: 'string' },
    },
    confidence: {
      type: 'number',
      minimum: 0,
      maximum: 1,
    },
    exerciseChanges: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['action', 'exerciseId', 'reason'],
        properties: {
          action: {
            type: 'string',
            enum: ['keep', 'replace', 'remove', 'add'],
          },
          exerciseId: { type: 'string' },
          replacementExerciseId: { type: 'string' },
          reason: { type: 'string' },
        },
      },
    },
    volumeChanges: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['target', 'targetId', 'action', 'reason'],
        properties: {
          target: {
            type: 'string',
            enum: ['routine', 'day', 'exercise'],
          },
          targetId: { type: 'string' },
          action: {
            type: 'string',
            enum: ['keep', 'increase', 'decrease'],
          },
          setsDelta: { type: 'number' },
          repsDelta: { type: 'number' },
          reason: { type: 'string' },
        },
      },
    },
    equipmentChanges: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['action', 'equipmentId', 'reason'],
        properties: {
          action: {
            type: 'string',
            enum: ['keep', 'replace', 'remove'],
          },
          equipmentId: { type: 'string' },
          replacementEquipmentId: { type: 'string' },
          reason: { type: 'string' },
        },
      },
    },
    reviewRequired: { type: 'boolean' },
  },
} as const;
