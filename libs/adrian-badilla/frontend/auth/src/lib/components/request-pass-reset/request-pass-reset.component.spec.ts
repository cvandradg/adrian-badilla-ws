import {
  MODULES,
  COMPONENTS,
  FirebaseAuthService,
} from '@adrian-badilla/ui/shared';
import { inject, provideAppInitializer } from '@angular/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { firebaseAuthStore } from '../../data-access/stores/auth.store';
import { FontAwesomeicons } from '../../../../../shared/src/lib/assets/icons/fontawesome';
import { RequestPassResetComponent } from './request-pass-reset.component';
import { ActivatedRoute } from '@angular/router';

jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: {},
}));

describe('RequestPassResetComponent', () => {
  let fixture: ComponentFixture<RequestPassResetComponent>;
  let component: RequestPassResetComponent;

  const mockStore = {
    createAccount: jest.fn(),
    isRegistering: jest.fn().mockReturnValue(false),
    registerSuccess: jest.fn().mockReturnValue(false),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestPassResetComponent, COMPONENTS, MODULES],
      providers: [
        { provide: firebaseAuthStore, useValue: mockStore },
        { provide: FirebaseAuthService, useValue: {} },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: new Map() } },
        },
        provideAppInitializer(() => {
          inject(FaIconLibrary).addIcons(...FontAwesomeicons);
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RequestPassResetComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
