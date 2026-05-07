export const DAY_ORDER: readonly string[] = [
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
  'domingo',
];

/** Orden canonical de tipos de comidas dentro de un día (0-5) */
export const MEAL_TYPE_ORDER: readonly string[] = [
  'breakfast',           // 0 - DESAYUNO (07:00)
  'morningSnack',        // 1 - Snack de la mañana (09:00)
  'lunch',               // 2 - ALMUERZO (12:00-13:00)
  'afternoonSnack',      // 3 - Snack Tarde (15:00-16:00)
  'dinner',              // 4 - CENA (19:00-20:00)
  'nightSnack',          // 5 - Snack Opcional (21:00+) — DEBE SER ÚLTIMO
];

export const DAY_LABELS: Readonly<Record<string, string>> = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miercoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sabado',
  domingo: 'Domingo',
};

export const MEAL_ICONS: Readonly<Record<string, string>> = {
  breakfast: 'pi pi-sun',
  morningSnack: 'pi pi-heart',
  lunch: 'pi pi-briefcase',
  afternoonSnack: 'pi pi-sparkles',
  dinner: 'pi pi-moon',
  nightSnack: 'pi pi-clock',
};

export const MEAL_DISPLAY_NAMES: Readonly<Record<string, string>> = {
  breakfast: 'DESAYUNO',
  morningSnack: 'Snack de la mañana',
  lunch: 'ALMUERZO',
  afternoonSnack: 'Snack Tarde',
  dinner: 'CENA',
  nightSnack: 'Snack Opcional',
};
