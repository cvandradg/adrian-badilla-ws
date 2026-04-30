import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import type { RouteNavItem } from '../../types/diets.types';

const DAY_ICONS: Record<string, string> = {
  lunes: 'pi pi-calendar',
  martes: 'pi pi-calendar',
  miercoles: 'pi pi-calendar',
  miércoles: 'pi pi-calendar',
  jueves: 'pi pi-calendar',
  viernes: 'pi pi-calendar',
  sabado: 'pi pi-calendar',
  sábado: 'pi pi-calendar',
  domingo: 'pi pi-sun',
};

@Component({
  selector: 'lib-adrian-badilla-diets-details',
  imports: [FontAwesomeModule],
  templateUrl: './adrian-badilla-diets-details.component.html',
  styleUrl: './adrian-badilla-diets-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdrianBadillaDietsDetailsComponent {
  readonly routes = input.required<readonly RouteNavItem[]>();
  readonly selectedRouteId = input<string | null>(null);
  readonly isEditorMode = input(false);

  readonly routeSelected = output<string>();
  readonly routeDeleteRequested = output<RouteNavItem>();

  readonly activeRouteIndex = computed(() => {
    const selectedId = this.selectedRouteId();
    return Math.max(0, this.routes().findIndex((r) => r.id === selectedId));
  });

  getDayIcon(name: string | undefined): string {
    return DAY_ICONS[name?.toLowerCase()?.trim() ?? ''] ?? 'pi pi-calendar';
  }

  selectRoute(routeId: string): void {
    this.routeSelected.emit(routeId);
  }

  requestRouteDelete(route: RouteNavItem, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.routeDeleteRequested.emit(route);
  }
}
