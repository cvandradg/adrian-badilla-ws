import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  signal,
  computed,
  inject,
  DestroyRef,
  AfterViewInit,
} from '@angular/core';
import { AdrianBadillaDietsComponent } from '../adrian-badilla-diets/adrian-badilla-diets.component';
import { DietHistorySettingsComponent } from '../diet-history/diet-history.component';
import { DialogService } from 'primeng/dynamicdialog';
import {
  SectionTabsComponent,
  type SectionTab,
} from '../section-tabs/section-tabs.component';
import { settingsStoreDev } from '../../store/settings.store';
import { SkeletonLoaderComponent } from '@adrian-badilla/ui/shared';

@Component({
  selector: 'lib-settings',
  standalone: true,
  imports: [
    FontAwesomeModule,
    AdrianBadillaDietsComponent,
    DietHistorySettingsComponent,
    SectionTabsComponent,
    SkeletonLoaderComponent,
  ],
  providers: [DialogService],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements AfterViewInit {
  private readonly store = inject(settingsStoreDev);

  readonly isMobile = signal(
    globalThis.window?.matchMedia('(max-width: 767px)').matches ?? false
  );

  readonly activeTab = signal('diets');

  readonly isLoadingDiet = computed(() => this.store.loadingDiet());

  constructor() {
    if (globalThis.window === undefined) return;
    const mql = globalThis.window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => this.isMobile.set(e.matches);
    mql.addEventListener('change', handler);
    inject(DestroyRef).onDestroy(() =>
      mql.removeEventListener('change', handler)
    );
  }

  readonly tabs: SectionTab[] = [
    { value: 'diets', label: 'Dietas', icon: ['fas', 'salad'] },
    { value: 'historial', label: 'Historial', icon: ['fas', 'rotate-back'] },
    { value: 'config', label: 'Configuración', icon: ['fas', 'bars'] },
  ];

  setActiveTab(value: string): void {
    this.activeTab.set(value);
  }

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
