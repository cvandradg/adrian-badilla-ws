export interface AIRoutineCoachExerciseChange {
  action: 'keep' | 'replace' | 'remove' | 'add';
  exerciseId: string;
  replacementExerciseId?: string;
  reason: string;
}

export interface AIRoutineCoachVolumeChange {
  target: 'routine' | 'day' | 'exercise';
  targetId: string;
  action: 'keep' | 'increase' | 'decrease';
  setsDelta?: number;
  repsDelta?: number;
  reason: string;
}

export interface AIRoutineCoachEquipmentChange {
  action: 'keep' | 'replace' | 'remove';
  equipmentId: string;
  replacementEquipmentId?: string;
  reason: string;
}

export interface AIRoutineCoachResponse {
  summary: string;
  adaptations: string[];
  warnings: string[];
  coachNotes: string[];
  confidence: number;
  exerciseChanges: AIRoutineCoachExerciseChange[];
  volumeChanges: AIRoutineCoachVolumeChange[];
  equipmentChanges: AIRoutineCoachEquipmentChange[];
  reviewRequired: boolean;
}

export interface AIRoutineCoachValidationResult {
  valid: boolean;
  errors: string[];
}
