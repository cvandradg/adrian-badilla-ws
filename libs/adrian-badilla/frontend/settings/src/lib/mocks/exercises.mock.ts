/**
 * Exercise mock data including descriptions and repetition targets.
 * Centralized source for all exercise information.
 */

export interface ExerciseMock {
  name: string;
  videoUrl: string;
  description: string;
  targetReps: number;
}
