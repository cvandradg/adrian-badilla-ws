import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdrianBadillaDietsComponent } from './adrian-badilla-diets.component';
import { Firestore } from '@angular/fire/firestore';
import { DialogService } from 'primeng/dynamicdialog';
import { provideHttpClient } from '@angular/common/http';
import { settingsStoreDev } from '../../store/settings.store';
import { billingStore } from '@adrian-badilla/billing';
import { aiStore } from '@adrian-badilla/ai';

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
          noActiveDiet: () => false,
          loadingDiet: () => false,
          dietFetchDone: () => true,
          loadingRoutine: () => false,
          errorDiet: () => null,
          saveRoute: jest.fn(),
          updateRouteSearchQuery: jest.fn(),
          clearRouteSearchQuery: jest.fn(),
          selectRoute: jest.fn(),
          openDietDialog: jest.fn(),
          openDietDialogFromChild: jest.fn(),
          updateSupercenterMealStatus: jest.fn(),
        }},
        { provide: billingStore, useValue: {
          isSubscriptionActive: () => false,
          isSubscriptionLoading: () => false,
        }},
        { provide: aiStore, useValue: {
          openChatForMeal: jest.fn(),
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
