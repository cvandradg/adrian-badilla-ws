import { HomeState } from '../models/home.model';

export const HOME_DATA: HomeState = {
  dailySummary: {
    calories: 1450,
    goal: 2200,
    protein: 95,
    carbs: 140,
    fats: 48,
  },
  recommendation: {
    text: 'Te faltan 30g de proteína. Prueba un batido de whey con avena y frutos rojos para cerrar el día.',
    type: 'protein',
  },
  streak: 3,
  weeklyProgress: [1800, 2100, 1950, 2200, 1700, 1450, 0],
  achievements: [
    { id: '1', label: '3 días seguidos', icon: '🔥', description: 'Registra comidas 3 días consecutivos', unlocked: true, date: '2026-04-28' },
    { id: '2', label: 'Proteína alcanzada', icon: '🥩', description: 'Cumple tu meta de proteína diaria', unlocked: true, date: '2026-04-27' },
    { id: '3', label: 'Bajo en grasas', icon: '💧', description: 'Mantén grasas bajo el 25%', unlocked: true, date: '2026-04-26' },
    { id: '4', label: 'Semana activa', icon: '⚡', description: 'Registra 7 días seguidos', unlocked: false },
    { id: '5', label: 'Maestro macro', icon: '🎯', description: 'Alcanza todos tus macros en un día', unlocked: false },
    { id: '6', label: 'Explorador', icon: '🧭', description: 'Prueba 10 comidas diferentes', unlocked: false },
  ],
  leaderboard: [
    { title: 'Día perfecto', value: 'Macros completos', position: 1 },
    { title: 'Alta proteína', value: '120g proteína', position: 2 },
    { title: 'Bajo en calorías', value: '1800 kcal', position: 3 },
    { title: 'Balanceado', value: 'Buen ratio macros', position: 4 },
    { title: 'Constancia', value: '3 días seguidos', position: 5 },
  ],
};
