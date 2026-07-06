export interface DailySummary {
  calories: number;
  goal: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface Recommendation {
  text: string;
  type: 'protein' | 'balanced' | 'light';
}

export interface Achievement {
  id: string;
  label: string;
  icon: string;
  description: string;
  unlocked: boolean;
  date?: string;
}

export interface LeaderboardEntry {
  title: string;
  value: string;
  position: number;
}

export interface HomeState {
  dailySummary: DailySummary;
  recommendation: Recommendation;
  streak: number;
  weeklyProgress: number[];
  achievements: Achievement[];
  leaderboard: LeaderboardEntry[];
}
