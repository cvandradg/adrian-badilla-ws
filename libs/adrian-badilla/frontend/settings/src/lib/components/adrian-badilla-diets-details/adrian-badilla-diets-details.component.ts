import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import type { RouteNavItem } from '../../types/diets.types';

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
    const index = this.routes().findIndex((route) => route.id === selectedId);

    return Math.max(0, index);
  });

  selectRoute(routeId: string): void {
    this.routeSelected.emit(routeId);
  }

  requestRouteDelete(route: RouteNavItem, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.routeDeleteRequested.emit(route);
  }
}
