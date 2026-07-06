import type { TourDefinition } from '../models/guided-tour.models';

/**
 * ─── DIET ONBOARDING TOUR ─────────────────────────────────────────────────────
 *
 * The introductory tour that guides a new user through the nutrition-planning
 * workflow. Seven steps that progressively reveal the key UX patterns.
 *
 * Anchor IDs map 1-to-1 with `appTourAnchor` directive usage in templates:
 *
 *   'hamburger-menu'  → dashboard header ☰ button
 *   'diets-tab'       → "Dietas" tab inside section-tabs
 *   'day-timeline'    → day-sidebar scroll strip
 *   'meal-timeline'   → full p-timeline card
 *   'meal-card'       → first meal card (registered conditionally on first item)
 *   'meal-check'      → status-actions area on first meal card
 *   'macro-progress'  → macro-progress-tracker section
 *
 * Copy guidelines:
 *  • Warm, professional tone — speaks to the user, not about the UI.
 *  • Present tense. No negative framing. Action-oriented.
 *  • Short enough to read in < 5 seconds on a mobile screen.
 */
export const DIET_ONBOARDING_TOUR: TourDefinition = {
  id: 'diet-onboarding-v1',
  name: 'Descubre tu Plan Nutricional',
  version: 1,
  /**
   * Set to `true` in production to auto-launch for users who have never
   * completed this tour (checked against TourPersistenceRecord).
   * Keep `false` during development — use the Tour FAB to trigger manually.
   */
  autoStart: false,

  steps: [
    {
      id: 'step-1-navigation',
      anchorId: 'hamburger-menu',
      title: 'Todo a tu alcance',
      content:
        'Aquí está tu menú principal. Tócalo para abrir la barra de navegación y descubrir todo lo que la app tiene para ti.',
      trigger: 'manual',
      preferredPosition: 'bottom',
    },
    {
      id: 'step-3-diets-tab',
      anchorId: 'diets-tab',
      route: '/dashboard/dietas',
      title: 'Tu Plan Nutricional',
      content:
        'Aquí centralizas toda tu planificación alimenticia. Revisa, gestiona y haz seguimiento de tu dieta semana a semana, adaptada a tus objetivos.',
      trigger: 'manual',
      preferredPosition: 'bottom',
    },
    {
      id: 'step-3-day-timeline',
      anchorId: 'day-timeline',
      route: '/dashboard/dietas',
      title: 'Elige tu Día',
      content:
        'Cada día de la semana tiene una distribución nutricional personalizada según tus metas. Toca cualquier día para consultar su plan completo en segundos.',
      trigger: 'manual',
      preferredPosition: 'bottom',
    },
    {
      id: 'step-4-meal-timeline',
      anchorId: 'meal-card',
      route: '/dashboard/dietas',
      title: 'Tu Agenda de Comidas',
      content:
        'Aquí ves el cronograma completo del día: cada comida, su horario sugerido y su aporte nutricional. Confirmar tus comidas mantiene tu racha activa y tu progreso al día.',
      trigger: 'manual',
      preferredPosition: 'bottom',
    },
    {
      id: 'step-5-meal-check-action',
      anchorId: 'meal-check',
      route: '/dashboard/dietas',
      title: 'Confirma tu Comida',
      content:
        'Pruébalo ahora — toca el ✓ para confirmar que completaste esta comida. Cada confirmación suma a tu racha diaria.',
      trigger: 'click',
      preferredPosition: 'bottom',
    },
    {
      id: 'step-6-meal-actions',
      anchorId: 'meal-marker',
      route: '/dashboard/dietas',
      title: 'Tu Progreso Visual',
      content:
        'Este ícono refleja el estado de cada comida en tiempo real: cambia de color al confirmar (✓) u omitir (✕). Día a día, ver tu timeline completo es la mejor señal de que tu plan está funcionando.',
      trigger: 'manual',
      preferredPosition: 'right',
    },
    {
      id: 'step-7-meal-detail',
      anchorId: 'meal-dropdown',
      route: '/dashboard/dietas',
      title: 'Ver Detalles de la Comida',
      content:
        'Toca la card para desplegar el resumen de preparación con ingredientes y pasos. Pruébalo ahora.',
      trigger: 'click',
      preferredPosition: 'bottom',
    },
    {
      id: 'step-8-meal-dropdown-content',
      anchorId: 'meal-dropdown-content',
      route: '/dashboard/dietas',
      title: 'Preparación y Sustitutos',
      content:
        'Aquí encuentras un resumen de la preparación de cada comida: ingredientes clave, pasos rápidos y sustitutos si no tienes algún ingrediente a mano.',
      trigger: 'manual',
      preferredPosition: 'top',
    },
    {
      id: 'step-7-macro-progress',
      anchorId: 'macro-progress',
      route: '/dashboard/dietas',
      title: 'Tu Avance Nutricional',
      content:
        'Este panel resume tu progreso del día en tiempo real: calorías acumuladas, proteína, carbohidratos y grasas. Cada comida confirmada se refleja aquí al instante.',
      trigger: 'manual',
      preferredPosition: 'top',
    },
  ],
};
