import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';
import { AdditionalInfoColumnComponent } from '../additional-info-column/additional-info-column.component';
import { TabsModule } from 'primeng/tabs';
import { AdrianBadillaDietsComponent } from '../adrian-badilla-diets/adrian-badilla-diets.component';
import { MacroProgressTrackerComponent } from '../macro-progress-tracker/macro-progress-tracker.component';
import { DialogService } from 'primeng/dynamicdialog';

@Component({
  selector: 'lib-settings',
  imports: [
    AdditionalInfoColumnComponent,
    TabsModule,
    FontAwesomeModule,
    AdrianBadillaDietsComponent,
    MacroProgressTrackerComponent,
  ],
  providers:[DialogService],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  tabs: { route: string; label: string; icon: [string, string] }[] = [
    {
      route: 'diets',
      label: 'Dietas',
      icon: ['fas', 'salad'],
    },
    {
      route: 'productos',
      label: 'Progreso',
      icon: ['fas', 'bars'],
    },
    {
      route: 'apariencia',
      label: 'Configuración',
      icon: ['fas', 'bars'],
    },
  ];

  routes = Array.from({ length: 24 }, (_, i) => i + 1);
  activeRouteIndex = 0;

  @ViewChild('routesScroll', { static: true })
  routesScroll!: ElementRef<HTMLDivElement>;

  canScrollUp = false;
  canScrollDown = false;

  private readonly LOREM =
    'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua';

  tabDescriptions = this.routes.map(() => {
    const max = 'Lorem ipsum dolor ipsum dolor!'.length;
    const len = 5 + Math.floor(Math.random() * (max - 5 + 1));
    return this.LOREM.slice(0, len).trim() + '!';
  });

  setActiveRoute(index: number) {
    this.activeRouteIndex = index;
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.updateScrollButtons());
  }

  onRoutesScroll(): void {
    this.updateScrollButtons();
  }

  scrollUp(): void {
    const el = this.routesScroll?.nativeElement;
    if (el) {
      el.scrollBy({ top: -this.scrollStep, behavior: 'smooth' });
    }
  }

  scrollDown(): void {
    const el = this.routesScroll?.nativeElement;
    if (el) {
      el.scrollBy({ top: this.scrollStep, behavior: 'smooth' });
    }
  }

  private get scrollStep(): number {
    return 3 * 52;
  }

  private updateScrollButtons(): void {
    const el = this.routesScroll?.nativeElement;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;

    this.canScrollUp = scrollTop > 0;
    this.canScrollDown = scrollTop + clientHeight < scrollHeight - 1;
  }
}
