import type {
  InjuryAreaId,
  MedicalConditionId,
  SeverityId,
} from '../../shared/catalogs/athlete-profile.catalogs';

export type InjurySeverityId = SeverityId;

export type RestrictedMovementPatternId =
  | 'squat'
  | 'hinge'
  | 'lunge'
  | 'push'
  | 'pull'
  | 'carry'
  | 'rotation'
  | 'overhead'
  | 'impact'
  | 'spinal_flexion';

export interface Injury {
  areaId: InjuryAreaId;
  severityId: InjurySeverityId | null;
  notes?: string;
  restrictedMovementPatternIds?: RestrictedMovementPatternId[];
}

export interface MedicalCondition {
  conditionId: MedicalConditionId;
  name?: string;
  severityId: InjurySeverityId | null;
  notes?: string;
  restrictedMovementPatternIds?: RestrictedMovementPatternId[];
}

export interface HealthRestrictions {
  injuries?: Injury[];
  medicalConditions?: MedicalCondition[];
  restrictedMovementPatternIds?: RestrictedMovementPatternId[];
  hasDisease?: boolean;
  diseaseDescription?: string;
  diseaseSeverity?: SeverityId | null;
  hasInjury?: boolean;
  injuryDescription?: string;
  injurySeverity?: SeverityId | null;
}

export interface AIHealthRestrictions extends HealthRestrictions {
  hasDisease: boolean;
  diseaseDescription: string;
  diseaseSeverity: SeverityId | null;
  hasInjury: boolean;
  injuryDescription: string;
  injurySeverity: SeverityId | null;
}
