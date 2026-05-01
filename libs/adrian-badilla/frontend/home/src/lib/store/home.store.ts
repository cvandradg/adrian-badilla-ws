import { computed } from '@angular/core';
import { signalStore, patchState, withComputed, withMethods, withState } from '@ngrx/signals';
import { HomeState } from '../models/home.model';
import { HOME_DATA } from '../mock/home.data';

const initialState: HomeState = {
  dailySummary: {
    calories: 0,
    goal: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  },
  recommendation: {
    text: '',
    type: 'balanced',
  },
  streak: 0,
  weeklyProgress: [],
  achievements: [],
  leaderboard: [],
};

export const HomeStore = signalStore(
  withState(initialState),
  withComputed(({ dailySummary, leaderboard }) => ({
    remainingCalories: computed(() => dailySummary().goal - dailySummary().calories),
    isGoalReached: computed(() => dailySummary().calories >= dailySummary().goal),
    macroPercentages: computed(() => {
      const summary = dailySummary();
      const total = summary.protein + summary.carbs + summary.fats;
      if (total === 0) return { protein: 0, carbs: 0, fats: 0 };
      return {
        protein: Math.round((summary.protein / (summary.goal / 4)) * 100),
        carbs: Math.round((summary.carbs / (summary.goal / 4)) * 100),
        fats: Math.round((summary.fats / (summary.goal / 9)) * 100),
      };
    }),
    topThree: computed(() => leaderboard().filter((e) => e.position <= 3)),
    restOfList: computed(() => leaderboard().filter((e) => e.position > 3)),
  })),
  withMethods((store) => ({
    loadHomeData(): void {
      patchState(store, HOME_DATA);
    },
  }))
);
