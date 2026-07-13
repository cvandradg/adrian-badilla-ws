export interface CanonicalCatalogItem<TId extends string = string> {
  id: TId;
  label: string;
  aliases?: readonly string[];
}

export type GoalId =
  | 'fat_loss'
  | 'muscle_gain'
  | 'body_recomposition'
  | 'sports_performance'
  | 'maintain_weight';

export type SecondaryGoalId = GoalId;
export type TrainingTypeId =
  | 'strength'
  | 'cardio'
  | 'hiit'
  | 'crossfit'
  | 'yoga_pilates'
  | 'martial_arts'
  | 'swimming'
  | 'cycling'
  | 'mixed'
  | 'other';

export type SportId =
  | 'gym'
  | 'bodybuilding'
  | 'powerlifting'
  | 'crossfit'
  | 'running'
  | 'cycling'
  | 'swimming'
  | 'soccer'
  | 'basketball'
  | 'martial_arts'
  | 'calisthenics'
  | 'other';

export type EquipmentId =
  | 'full_gym'
  | 'dumbbells'
  | 'barbell'
  | 'olympic_bar'
  | 'weight_plates'
  | 'bench'
  | 'cables'
  | 'cable_pulley'
  | 'smith_machine'
  | 'resistance_bands'
  | 'trx'
  | 'bodyweight'
  | 'bodyweight_only'
  | 'kettlebell'
  | 'rack'
  | 'multi_machine'
  | 'other';

export type TrainingExperienceId = 'beginner' | 'intermediate' | 'advanced';
export type TrainingLocationId = 'home' | 'gym' | 'hybrid';
export type PreferredScheduleId =
  | 'morning'
  | 'afternoon'
  | 'evening'
  | 'night'
  | 'flexible';

export type TrainingConsistencyId = 'low' | 'medium' | 'high';
export type TrainingStylePreferenceId = 'short' | 'balanced' | 'long';
export type MealScheduleId = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type SeverityId = 'mild' | 'moderate' | 'severe';
export type InjuryAreaId =
  | 'ankle'
  | 'knee'
  | 'hip'
  | 'shoulder'
  | 'elbow'
  | 'wrist'
  | 'neck'
  | 'lower_back';
export type MedicalConditionId =
  | 'asthma'
  | 'hypertension'
  | 'diabetes'
  | 'arthritis'
  | 'other';
export type WeekDayId =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type MuscleId =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'quadriceps'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'core';

export const GOAL_CATALOG: readonly CanonicalCatalogItem<GoalId>[] = [
  {
    id: 'muscle_gain',
    label: 'Ganar músculo',
    aliases: [
      'gain_muscle',
      'gain muscle',
      'ganar musculo',
      'ganar masa',
      'masa muscular',
    ],
  },
  {
    id: 'fat_loss',
    label: 'Bajar grasa',
    aliases: ['lose_fat', 'lose fat', 'fat loss', 'bajar grasa'],
  },
  {
    id: 'body_recomposition',
    label: 'Recomposición corporal',
    aliases: ['body recomposition', 'recomposicion corporal', 'recomposition'],
  },
  {
    id: 'sports_performance',
    label: 'Rendimiento deportivo',
    aliases: [
      'sports performance',
      'sport performance',
      'rendimiento deportivo',
    ],
  },
  {
    id: 'maintain_weight',
    label: 'Mantener peso',
    aliases: ['maintain weight', 'weight maintenance', 'mantener peso'],
  },
];

export const SECONDARY_GOAL_CATALOG = GOAL_CATALOG;

export const TRAINING_TYPE_CATALOG: readonly CanonicalCatalogItem<TrainingTypeId>[] =
  [
    { id: 'strength', label: 'Fuerza', aliases: ['fuerza', 'strength'] },
    { id: 'cardio', label: 'Cardio', aliases: ['cardio'] },
    { id: 'hiit', label: 'HIIT', aliases: ['hiit'] },
    { id: 'crossfit', label: 'CrossFit', aliases: ['cross fit', 'crossfit'] },
    {
      id: 'yoga_pilates',
      label: 'Yoga / Pilates',
      aliases: ['yoga pilates', 'yoga / pilates', 'pilates', 'yoga'],
    },
    {
      id: 'martial_arts',
      label: 'Artes marciales',
      aliases: ['artes marciales', 'martial arts'],
    },
    { id: 'swimming', label: 'Natación', aliases: ['natacion', 'swimming'] },
    { id: 'cycling', label: 'Ciclismo', aliases: ['ciclismo', 'cycling'] },
    { id: 'mixed', label: 'Mixto', aliases: ['mixed', 'mixto'] },
    { id: 'other', label: 'Otro', aliases: ['otro', 'other'] },
  ];

export const SPORT_CATALOG: readonly CanonicalCatalogItem<SportId>[] = [
  { id: 'gym', label: 'Gym', aliases: ['gimnasio', 'gym'] },
  {
    id: 'bodybuilding',
    label: 'Fisicoculturismo',
    aliases: ['fisicoculturismo', 'bodybuilding'],
  },
  {
    id: 'powerlifting',
    label: 'Powerlifting',
    aliases: ['powerlifting'],
  },
  { id: 'crossfit', label: 'CrossFit', aliases: ['cross fit', 'crossfit'] },
  { id: 'running', label: 'Running', aliases: ['running', 'correr'] },
  { id: 'cycling', label: 'Ciclismo', aliases: ['ciclismo', 'cycling'] },
  { id: 'swimming', label: 'Natación', aliases: ['natacion', 'swimming'] },
  { id: 'soccer', label: 'Fútbol', aliases: ['futbol', 'football', 'soccer'] },
  {
    id: 'basketball',
    label: 'Baloncesto',
    aliases: ['baloncesto', 'basketball', 'basquetbol'],
  },
  {
    id: 'martial_arts',
    label: 'Artes marciales',
    aliases: ['artes marciales', 'martial arts'],
  },
  {
    id: 'calisthenics',
    label: 'Calistenia',
    aliases: ['calistenia', 'calisthenics'],
  },
  { id: 'other', label: 'Otro', aliases: ['otro', 'other'] },
];

export const EQUIPMENT_CATALOG: readonly CanonicalCatalogItem<EquipmentId>[] = [
  {
    id: 'full_gym',
    label: 'Gimnasio completo',
    aliases: ['full gym', 'full_gym', 'gimnasio completo'],
  },
  {
    id: 'dumbbells',
    label: 'Mancuernas',
    aliases: ['mancuernas', 'dumbbells'],
  },
  { id: 'barbell', label: 'Barra', aliases: ['barra', 'barbell'] },
  {
    id: 'olympic_bar',
    label: 'Barra olímpica',
    aliases: ['barra olimpica', 'olympic bar', 'olympic_bar'],
  },
  {
    id: 'weight_plates',
    label: 'Discos',
    aliases: ['discos', 'weight plates', 'weight_plates'],
  },
  { id: 'bench', label: 'Banco', aliases: ['banco', 'bench'] },
  { id: 'cables', label: 'Poleas', aliases: ['poleas', 'cables'] },
  {
    id: 'cable_pulley',
    label: 'Polea',
    aliases: ['polea', 'cable pulley', 'cable_pulley'],
  },
  {
    id: 'smith_machine',
    label: 'Máquina Smith',
    aliases: ['maquina smith', 'smith machine', 'smith_machine'],
  },
  {
    id: 'resistance_bands',
    label: 'Bandas elásticas',
    aliases: [
      'bandas elasticas',
      'bandas',
      'resistance bands',
      'resistance_bands',
    ],
  },
  { id: 'trx', label: 'TRX', aliases: ['trx'] },
  {
    id: 'bodyweight',
    label: 'Peso corporal',
    aliases: ['peso corporal', 'bodyweight'],
  },
  {
    id: 'bodyweight_only',
    label: 'Peso corporal solamente',
    aliases: ['bodyweight only', 'bodyweight_only', 'peso corporal solamente'],
  },
  { id: 'kettlebell', label: 'Kettlebell', aliases: ['kettlebell'] },
  { id: 'rack', label: 'Rack', aliases: ['rack'] },
  {
    id: 'multi_machine',
    label: 'Máquina multifunción',
    aliases: ['maquina multifuncion', 'multi machine', 'multi_machine'],
  },
  { id: 'other', label: 'Otro', aliases: ['otro', 'other'] },
];

export const TRAINING_EXPERIENCE_CATALOG: readonly CanonicalCatalogItem<TrainingExperienceId>[] =
  [
    {
      id: 'beginner',
      label: 'Principiante',
      aliases: ['principiante', 'beginner'],
    },
    {
      id: 'intermediate',
      label: 'Intermedio',
      aliases: ['intermedio', 'intermediate'],
    },
    { id: 'advanced', label: 'Avanzado', aliases: ['avanzado', 'advanced'] },
  ];

export const TRAINING_LOCATION_CATALOG: readonly CanonicalCatalogItem<TrainingLocationId>[] =
  [
    { id: 'gym', label: 'Gimnasio', aliases: ['gym', 'gimnasio'] },
    { id: 'home', label: 'Casa', aliases: ['home', 'casa'] },
    {
      id: 'hybrid',
      label: 'Híbrido',
      aliases: ['both', 'ambos', 'hybrid', 'hibrido'],
    },
  ];

export const PREFERRED_SCHEDULE_CATALOG: readonly CanonicalCatalogItem<PreferredScheduleId>[] =
  [
    { id: 'morning', label: 'Mañana', aliases: ['morning', 'manana'] },
    {
      id: 'afternoon',
      label: 'Tarde',
      aliases: ['afternoon', 'tarde', 'midday', 'mediodia'],
    },
    { id: 'evening', label: 'Noche', aliases: ['evening'] },
    { id: 'night', label: 'Madrugada', aliases: ['night', 'noche'] },
    { id: 'flexible', label: 'Flexible', aliases: ['flexible'] },
  ];

export const TRAINING_CONSISTENCY_CATALOG: readonly CanonicalCatalogItem<TrainingConsistencyId>[] =
  [
    { id: 'low', label: 'Baja', aliases: ['low', 'baja'] },
    { id: 'medium', label: 'Media', aliases: ['medium', 'media'] },
    { id: 'high', label: 'Alta', aliases: ['high', 'alta'] },
  ];

export const TRAINING_STYLE_PREFERENCE_CATALOG: readonly CanonicalCatalogItem<TrainingStylePreferenceId>[] =
  [
    {
      id: 'short',
      label: 'Cortos e intensos',
      aliases: ['short', 'cortos e intensos'],
    },
    {
      id: 'balanced',
      label: 'Balanceados',
      aliases: ['medium', 'balanced', 'moderados', 'balanceado'],
    },
    {
      id: 'long',
      label: 'Largos y progresivos',
      aliases: ['long', 'largos y progresivos'],
    },
  ];

export const MEAL_SCHEDULE_CATALOG: readonly CanonicalCatalogItem<MealScheduleId>[] =
  [
    { id: 'breakfast', label: 'Desayuno', aliases: ['breakfast', 'desayuno'] },
    { id: 'lunch', label: 'Almuerzo', aliases: ['lunch', 'almuerzo'] },
    { id: 'dinner', label: 'Cena', aliases: ['dinner', 'cena'] },
    {
      id: 'snack',
      label: 'Snack',
      aliases: [
        'snack',
        'merienda',
        'mid morning',
        'mid_morning',
        'media manana',
        'afternoon snack',
        'afternoon_snack',
        'post workout',
        'post_workout',
        'post entreno',
      ],
    },
  ];

export const SEVERITY_CATALOG: readonly CanonicalCatalogItem<SeverityId>[] = [
  { id: 'mild', label: 'Leve', aliases: ['mild', 'minor', 'leve'] },
  { id: 'moderate', label: 'Moderada', aliases: ['moderate', 'moderada'] },
  { id: 'severe', label: 'Severa', aliases: ['severe', 'severa'] },
];

export const INJURY_AREA_CATALOG: readonly CanonicalCatalogItem<InjuryAreaId>[] =
  [
    { id: 'ankle', label: 'Tobillo', aliases: ['ankle', 'tobillo'] },
    { id: 'knee', label: 'Rodilla', aliases: ['knee', 'rodilla'] },
    { id: 'hip', label: 'Cadera', aliases: ['hip', 'cadera'] },
    { id: 'shoulder', label: 'Hombro', aliases: ['shoulder', 'hombro'] },
    { id: 'elbow', label: 'Codo', aliases: ['elbow', 'codo'] },
    { id: 'wrist', label: 'Muneca', aliases: ['wrist', 'muneca', 'muñeca'] },
    { id: 'neck', label: 'Cuello', aliases: ['neck', 'cuello'] },
    {
      id: 'lower_back',
      label: 'Espalda baja',
      aliases: ['lower back', 'lower_back', 'espalda baja', 'lumbar'],
    },
  ];

export const MEDICAL_CONDITION_CATALOG: readonly CanonicalCatalogItem<MedicalConditionId>[] =
  [
    { id: 'asthma', label: 'Asma', aliases: ['asthma', 'asma'] },
    {
      id: 'hypertension',
      label: 'Hipertension',
      aliases: ['hypertension', 'hipertension', 'hipertensión'],
    },
    { id: 'diabetes', label: 'Diabetes', aliases: ['diabetes'] },
    { id: 'arthritis', label: 'Artritis', aliases: ['arthritis', 'artritis'] },
    { id: 'other', label: 'Otra', aliases: ['other', 'otra'] },
  ];

export const WEEK_DAY_CATALOG: readonly CanonicalCatalogItem<WeekDayId>[] = [
  { id: 'monday', label: 'Lun', aliases: ['lunes', 'monday', 'lun'] },
  { id: 'tuesday', label: 'Mar', aliases: ['martes', 'tuesday', 'mar'] },
  {
    id: 'wednesday',
    label: 'Mié',
    aliases: ['miercoles', 'miércoles', 'wednesday', 'mie'],
  },
  { id: 'thursday', label: 'Jue', aliases: ['jueves', 'thursday', 'jue'] },
  { id: 'friday', label: 'Vie', aliases: ['viernes', 'friday', 'vie'] },
  {
    id: 'saturday',
    label: 'Sáb',
    aliases: ['sabado', 'sábado', 'saturday', 'sab'],
  },
  { id: 'sunday', label: 'Dom', aliases: ['domingo', 'sunday', 'dom'] },
];

export const MUSCLE_CATALOG: readonly CanonicalCatalogItem<MuscleId>[] = [
  { id: 'chest', label: 'Pecho', aliases: ['chest', 'pecho'] },
  { id: 'back', label: 'Espalda', aliases: ['back', 'espalda'] },
  { id: 'shoulders', label: 'Hombros', aliases: ['shoulders', 'hombros'] },
  { id: 'biceps', label: 'Bíceps', aliases: ['biceps', 'bíceps'] },
  { id: 'triceps', label: 'Tríceps', aliases: ['triceps', 'tríceps'] },
  {
    id: 'quadriceps',
    label: 'Cuádriceps',
    aliases: ['quadriceps', 'cuadriceps', 'cuádriceps'],
  },
  {
    id: 'hamstrings',
    label: 'Isquiotibiales',
    aliases: ['hamstrings', 'isquiotibiales'],
  },
  { id: 'glutes', label: 'Glúteos', aliases: ['glutes', 'gluteos', 'glúteos'] },
  {
    id: 'calves',
    label: 'Pantorrillas',
    aliases: ['calves', 'pantorrillas', 'gemelos'],
  },
  { id: 'core', label: 'Core', aliases: ['core', 'abdomen', 'abs'] },
];
