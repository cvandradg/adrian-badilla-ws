import type {
  BodyMeasurements,
  ProgressAnalysisContext,
  WeeklyProgressCheckIn,
} from '../types/weekly-progress.types';

function collectMeasurementChanges(
  checkIns: WeeklyProgressCheckIn[],
  field: keyof BodyMeasurements
): number[] {
  const deltas: number[] = [];

  for (let index = 0; index < checkIns.length - 1; index += 1) {
    const current = checkIns[index]?.measurements[field];
    const previous = checkIns[index + 1]?.measurements[field];

    if (current == null || previous == null) {
      continue;
    }

    deltas.push(+(current - previous).toFixed(1));
  }

  return deltas;
}

export class ProgressAnalysisContextBuilder {
  build(checkIns: WeeklyProgressCheckIn[]): ProgressAnalysisContext {
    const latestCheckIns = [...checkIns].sort((left, right) =>
      right.weekId.localeCompare(left.weekId)
    );

    return {
      latestCheckIns,
      weightChangesKg: collectMeasurementChanges(latestCheckIns, 'weightKg'),
      measurementChanges: {
        chestCm: collectMeasurementChanges(latestCheckIns, 'chestCm'),
        waistCm: collectMeasurementChanges(latestCheckIns, 'waistCm'),
        hipCm: collectMeasurementChanges(latestCheckIns, 'hipCm'),
        leftArmCm: collectMeasurementChanges(latestCheckIns, 'leftArmCm'),
        rightArmCm: collectMeasurementChanges(latestCheckIns, 'rightArmCm'),
        thighCm: collectMeasurementChanges(latestCheckIns, 'thighCm'),
        calfCm: collectMeasurementChanges(latestCheckIns, 'calfCm'),
        bodyFatPercent: collectMeasurementChanges(
          latestCheckIns,
          'bodyFatPercent'
        ),
      },
      dietAdherencePercent: latestCheckIns
        .map((item) => item.selfAssessment.dietAdherencePercent)
        .filter((item): item is number => item != null),
      sleepAverageHours: latestCheckIns
        .map((item) => item.selfAssessment.sleepAverageHours)
        .filter((item): item is number => item != null),
      energy: latestCheckIns
        .map((item) => item.selfAssessment.energy)
        .filter((item): item is number => item != null),
      stress: latestCheckIns
        .map((item) => item.selfAssessment.stress)
        .filter((item): item is number => item != null),
      motivation: latestCheckIns
        .map((item) => item.selfAssessment.motivation)
        .filter((item): item is number => item != null),
      notes: latestCheckIns
        .map((item) => item.notes.trim())
        .filter(Boolean),
    };
  }
}
