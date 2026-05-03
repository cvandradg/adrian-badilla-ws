import type { Routine, RoutineDay } from '../adapters/decision-item.adapters';

export const ROUTINES_MOCK: Routine[] = [
  { id: 'r1', name: 'Pierna',   time: '08:00', status: 'pending', exercises: ['Squat', 'Leg Press', 'Lunges'] },
  { id: 'r2', name: 'Pecho',    time: '10:00', status: 'pending', exercises: ['Bench Press', 'Incline Press'] },
  { id: 'r3', name: 'Espalda',  time: '12:00', status: 'pending', exercises: ['Pull-Up', 'Barbell Row', 'Lat Pulldown'] },
  { id: 'r4', name: 'Hombros',  time: '15:00', status: 'pending', exercises: ['Overhead Press', 'Lateral Raise'] },
];

export const ROUTINE_DAYS_MOCK: RoutineDay[] = [
  {
    id: 'day1',
    label: 'Lunes',
    date: '6 de Abril 2026',
    routines: [
      { id: 'r1', name: 'Pierna',  time: '08:00', status: 'pending', exercises: ['Squat', 'Leg Press', 'Lunges'] },
      { id: 'r2', name: 'Pecho',   time: '10:00', status: 'pending', exercises: ['Bench Press', 'Incline Press'] },
    ],
  },
  {
    id: 'day2',
    label: 'Martes',
    date: '7 de Abril 2026',
    routines: [
      { id: 'r3', name: 'Espalda', time: '09:00', status: 'pending', exercises: ['Pull-Up', 'Barbell Row', 'Lat Pulldown'] },
    ],
  },
  {
    id: 'day3',
    label: 'Miércoles',
    date: '8 de Abril 2026',
    routines: [
      { id: 'r4', name: 'Hombros', time: '08:30', status: 'pending', exercises: ['Overhead Press', 'Lateral Raise'] },
      { id: 'r5', name: 'Bíceps',  time: '09:30', status: 'pending', exercises: ['Barbell Curl', 'Hammer Curl'] },
    ],
  },
  {
    id: 'day4',
    label: 'Jueves',
    date: '9 de Abril 2026',
    routines: [
      { id: 'r6', name: 'Pierna (Volumen)', time: '08:00', status: 'pending', exercises: ['Leg Extension', 'Romanian Deadlift', 'Calf Raise'] },
    ],
  },
  {
    id: 'day5',
    label: 'Viernes',
    date: '10 de Abril 2026',
    routines: [
      { id: 'r7', name: 'Pecho + Tríceps', time: '10:00', status: 'pending', exercises: ['Cable Fly', 'Dips', 'Skull Crushers'] },
    ],
  },
];
