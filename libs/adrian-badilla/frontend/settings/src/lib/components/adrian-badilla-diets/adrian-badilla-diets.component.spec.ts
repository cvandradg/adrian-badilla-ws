import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdrianBadillaDietsComponent } from './adrian-badilla-diets.component';
import { Firestore } from '@angular/fire/firestore';
import { DialogService } from 'primeng/dynamicdialog';
import { provideHttpClient } from '@angular/common/http';
import { settingsStoreDev } from '../../store/settings.store';

describe('AdrianBadillaDietsComponent', () => {
  let component: AdrianBadillaDietsComponent;
  let fixture: ComponentFixture<AdrianBadillaDietsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdrianBadillaDietsComponent],
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

    fixture = TestBed.createComponent(AdrianBadillaDietsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
