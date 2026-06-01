export * from './lib/settings.routes';

export * from './lib/components/settings-overview/settings.component';
export * from './lib/components/nutrition-chat/nutrition-chat.component';

// ── Guided Tour (export for dashboard shell integration) ──────────────────────
export { TourOverlayComponent } from './lib/guided-tour/components/tour-overlay/tour-overlay.component';
export { TourFabComponent } from './lib/guided-tour/components/tour-fab/tour-fab.component';
export { settingsStoreDev } from './lib/store/settings.store';
export type {
  TourDefinition,
  TourStep,
  SpotlightRect,
} from './lib/guided-tour/models/guided-tour.models';
