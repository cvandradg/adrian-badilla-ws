import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { AdrianBadillaDietsComponent } from '../adrian-badilla-diets/adrian-badilla-diets.component';
import { DietHistorySettingsComponent } from '../diet-history/diet-history.component';
import { DialogService } from 'primeng/dynamicdialog';
import {
  SectionTabsComponent,
  type SectionTab,
} from '../section-tabs/section-tabs.component';

@Component({
  selector: 'lib-settings',
  standalone: true,
  imports: [
    FontAwesomeModule,
    AdrianBadillaDietsComponent,
    DietHistorySettingsComponent,
    SectionTabsComponent,
  ],
  providers: [DialogService],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  readonly isMobile = signal(
    globalThis.window?.matchMedia('(max-width: 767px)').matches ?? false
  );

  readonly activeTab = signal('diets');

  readonly #mqlCleanup = (() => {
    if (globalThis.window === undefined) return;
    const mql = globalThis.window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => this.isMobile.set(e.matches);
    mql.addEventListener('change', handler);
    inject(DestroyRef).onDestroy(() =>
      mql.removeEventListener('change', handler)
    );
  })();

  readonly tabs: SectionTab[] = [
    { value: 'diets', label: 'Dietas', icon: ['fas', 'salad'] },
    { value: 'historial', label: 'Historial', icon: ['fas', 'rotate-back'] },
    { value: 'config', label: 'Configuración', icon: ['fas', 'bars'] },
  ];

  setActiveTab(value: string): void {
    this.activeTab.set(value);
  }
}
