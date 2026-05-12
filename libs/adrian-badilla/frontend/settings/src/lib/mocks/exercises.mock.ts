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

export const EXERCISES_MOCK: Record<string, ExerciseMock> = {
  // ── Pierna ─────────────────────────────────────────────────────────────
  'Squat': {
    name: 'Squat',
    videoUrl: '/global/assets/videos/15079385_1080_1920_30fps.mp4',
    description: 'Párate con los pies al ancho de los hombros. Baja tu cuerpo manteniendo la espalda recta y las rodillas en línea con los tobillos. Desciende hasta que los muslos estén paralelos al suelo. Luego empuja con los talones para volver a la posición inicial.',
    targetReps: 12,
  },
  'Leg Press': {
    name: 'Leg Press',
    videoUrl: '/global/assets/videos/legsPress.mp4',
    description: 'Siéntate con la espalda y cabeza apoyadas en el asiento. Coloca los pies en la plataforma al ancho de los hombros. Baja el peso controlado hasta que las rodillas formen un ángulo de 90 grados, sin que toquen el pecho. Extiende las piernas para volver al inicio.',
    targetReps: 15,
  },
  'Lunges': {
    name: 'Lunges',
    videoUrl: '/global/assets/videos/lunges.mp4',
    description: 'De pie, da un paso adelante con una pierna. Baja tu cuerpo flexionando ambas rodillas hasta formar ángulos de 90 grados. La rodilla trasera casi toca el suelo. Vuelve a la posición inicial y repite con la otra pierna.',
    targetReps: 10,
  },
  'Leg Extension': {
    name: 'Leg Extension',
    videoUrl: '',
    description: 'Siéntate en la máquina con la espalda apoyada. Coloca los pies bajo la palanca. Extiende las piernas hacia adelante hasta que estén completamente rectas, contrayendo el cuádriceps. Baja controlado a la posición inicial.',
    targetReps: 12,
  },
  'Romanian Deadlift': {
    name: 'Romanian Deadlift',
    videoUrl: '',
    description: 'De pie con los pies al ancho de las caderas, sosteniendo mancuernas. Inclina las caderas hacia adelante manteniendo la espalda recta y las piernas ligeramente flexionadas. Desciende hasta sentir un estiramiento en los isquiotibiales, luego vuelve a la posición inicial.',
    targetReps: 10,
  },
  'Calf Raise': {
    name: 'Calf Raise',
    videoUrl: '',
    description: 'De pie, levántate sobre las puntas de los pies lo máximo posible, contrayendo los pantorrillas. Mantén la posición por un segundo. Baja controlado los talones hacia el suelo. Repite el movimiento.',
    targetReps: 15,
  },

  // ── Pecho ──────────────────────────────────────────────────────────────
  'Bench Press': {
    name: 'Bench Press',
    videoUrl: '',
    description: 'Acuéstate en el banco con los pies en el suelo. Agarra la barra al ancho de los hombros. Baja la barra hacia el pecho controlado. Presiona la barra hacia arriba hasta extender completamente los codos. Repite de manera controlada.',
    targetReps: 8,
  },
  'Incline Press': {
    name: 'Incline Press',
    videoUrl: '',
    description: 'Ajusta el banco a un ángulo de 45 grados. Acuéstate con los pies en el suelo. Agarra la barra al ancho de los hombros. Baja hacia el pecho superior, luego presiona hacia arriba. Mantén el control durante todo el movimiento.',
    targetReps: 10,
  },
  'Cable Fly': {
    name: 'Cable Fly',
    videoUrl: '',
    description: 'De pie en medio de dos poleas de cable. Agarra las manijas con los codos ligeramente flexionados. Abre los brazos hacia los lados describiendo un arco. Junta las manijas frente al pecho, contrayendo el pecho. Vuelve a la posición inicial de manera controlada.',
    targetReps: 12,
  },

  // ── Espalda ────────────────────────────────────────────────────────────
  'Pull-Up': {
    name: 'Pull-Up',
    videoUrl: '',
    description: 'Cuelgate de una barra con las manos al ancho de los hombros, palmas hacia adelante. Jala tu cuerpo hacia arriba hasta que la barbilla pase la barra. Baja controlado a la posición inicial. Mantén el pecho hacia adelante durante todo el movimiento.',
    targetReps: 8,
  },
  'Barbell Row': {
    name: 'Barbell Row',
    videoUrl: '',
    description: 'De pie con los pies al ancho de las caderas, sostén la barra. Inclina el torso hacia adelante con la espalda recta. Jala la barra hacia el abdomen, apretando los omóplatos. Baja controlado a la posición inicial.',
    targetReps: 10,
  },
  'Lat Pulldown': {
    name: 'Lat Pulldown',
    videoUrl: '',
    description: 'Siéntate con los muslos bajo la palanca. Agarra la barra al ancho de los hombros. Tira de la barra hacia el pecho, llevando los codos hacia los lados. Controla el regreso a la posición inicial. Enfócate en usar la espalda, no los brazos.',
    targetReps: 12,
  },

  // ── Hombros ────────────────────────────────────────────────────────────
  'Overhead Press': {
    name: 'Overhead Press',
    videoUrl: '',
    description: 'De pie con los pies al ancho de los hombros, sostén la barra a la altura de los hombros. Presiona la barra hacia arriba hasta extender completamente los codos. Baja controlado a la posición inicial, sin arquear excesivamente la espalda.',
    targetReps: 8,
  },
  'Lateral Raise': {
    name: 'Lateral Raise',
    videoUrl: '',
    description: 'De pie con los pies al ancho de las caderas, sostén mancuernas a los costados. Levanta los brazos hacia los lados hasta la altura de los hombros, formando una "T" con tu cuerpo. Baja controlado a la posición inicial sin balancearte.',
    targetReps: 12,
  },

  // ── Bíceps / Tríceps ───────────────────────────────────────────────────
  'Barbell Curl': {
    name: 'Barbell Curl',
    videoUrl: '',
    description: 'De pie con los pies al ancho de los hombros. Sostén la barra con las palmas hacia adelante. Flexiona los codos levantando la barra hacia los hombros. Baja controlado a la posición inicial. Evita balancear el cuerpo.',
    targetReps: 10,
  },
  'Hammer Curl': {
    name: 'Hammer Curl',
    videoUrl: '',
    description: 'De pie con los pies al ancho de los hombros. Sostén las mancuernas con las palmas una hacia la otra (posición martillo). Flexiona los codos levantando hacia los hombros. Baja controlado a la posición inicial.',
    targetReps: 12,
  },
  'Dips': {
    name: 'Dips',
    videoUrl: '',
    description: 'Cuelgate de las barras con los brazos extendidos. Flexiona los codos bajando tu cuerpo. Las rodillas pueden estar ligeramente flexionadas. Sube empujando con los tríceps hasta extender los codos. Mantén el cuerpo recto.',
    targetReps: 8,
  },
  'Skull Crushers': {
    name: 'Skull Crushers',
    videoUrl: '',
    description: 'Acuéstate en un banco con los pies en el suelo. Sostén una barra o mancuernas sobre el pecho. Baja el peso hacia la coronilla flexionando los codos. Extiende los codos para volver a la posición inicial. Mantén los brazos relativamente inmóviles.',
    targetReps: 10,
  },
};
