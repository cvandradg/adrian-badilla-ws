import type { AIBmiCategory } from '../models/ai-user-context.model';
import type { TrainingExperienceId } from '../../shared/catalogs/athlete-profile.catalogs';

function roundMetric(value: number): number {
  return Math.round(value * 10) / 10;
}

export function calculateBmi(
  weightKg: number | null | undefined,
  heightCm: number | null | undefined
): number | null {
  if (!weightKg || !heightCm || heightCm <= 0) return null;

  const heightM = heightCm / 100;
  return roundMetric(weightKg / (heightM * heightM));
}

export function calculateBmiCategory(
  bmi: number | null | undefined
): AIBmiCategory | null {
  if (bmi == null) return null;
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obesity';
}

export function calculateBmiScore(
  bmi: number | null | undefined
): number | null {
  if (bmi == null) return null;

  const distance = Math.abs(bmi - 22);
  return Math.max(0, roundMetric(100 - distance * 8));
}

export function calculateIdealWeight(
  heightCm: number | null | undefined,
  targetBmi = 22
): number | null {
  if (!heightCm || heightCm <= 0) return null;

  const heightM = heightCm / 100;
  return roundMetric(targetBmi * heightM * heightM);
}

export function calculateLeanBodyMass(
  weightKg: number | null | undefined,
  bodyFatPercent: number | null | undefined
): number | null {
  if (weightKg == null) return null;
  if (bodyFatPercent == null) return null;

  return roundMetric(weightKg * (1 - bodyFatPercent / 100));
}

export function calculateFatMass(
  weightKg: number | null | undefined,
  bodyFatPercent: number | null | undefined
): number | null {
  if (weightKg == null) return null;
  if (bodyFatPercent == null) return null;

  return roundMetric(weightKg * (bodyFatPercent / 100));
}

export function calculateCalorieEstimate(
  weightKg: number | null | undefined,
  trainingConsistency: 'low' | 'medium' | 'high' | null | undefined,
  leanBodyMassKg?: number | null
): number | null {
  if (leanBodyMassKg != null) {
    const activityFactor =
      trainingConsistency === 'high'
        ? 1.7
        : trainingConsistency === 'medium'
        ? 1.55
        : 1.4;

    return Math.round((370 + 21.6 * leanBodyMassKg) * activityFactor);
  }

  if (weightKg == null) return null;

  const weightFactor =
    trainingConsistency === 'high'
      ? 34
      : trainingConsistency === 'medium'
      ? 31
      : 28;

  return Math.round(weightKg * weightFactor);
}

export function calculateTrainingAgeCategory(
  monthsTraining: number | null | undefined,
  fallback?: TrainingExperienceId | null
): TrainingExperienceId | null {
  if (monthsTraining == null || monthsTraining < 0) {
    return fallback ?? null;
  }

  if (monthsTraining < 12) return 'beginner';
  if (monthsTraining < 36) return 'intermediate';
  return 'advanced';
}
