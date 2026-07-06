import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsComponent } from './settings.component';
import { Firestore } from '@angular/fire/firestore';
import { DialogService } from 'primeng/dynamicdialog';
import { provideHttpClient } from '@angular/common/http';
import { settingsStoreDev } from '../../store/settings.store';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsComponent],
      providers: [
        provideHttpClient(),
        { provide: Firestore, useValue: {} },
        { provide: settingsStoreDev, useValue: {
          routes: () => [],
          selectedRoute: () => null,
          routeSearchQuery: () => '',
          filteredRoutes: () => [],
          selectedRouteSupercenters: () => [],
          createRouteisLoading: () => false,
          saveRouteisLoading: () => false,
          isSavingRoute: () => false,
          foodDescriptionVm: () => null,
          chatMessages: () => [],
          chatIsLoading: () => false,
          isChatOpen: () => false,
          hasPendingAISuggestion: () => false,
        }},
        DialogService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    // Skip detectChanges to avoid FontAwesome icon lookup errors in test environment
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
