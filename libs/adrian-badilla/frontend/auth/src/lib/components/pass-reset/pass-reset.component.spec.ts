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
import { PassResetComponent } from './pass-reset.component';

jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: {},
}));

describe('PassResetComponent', () => {
  let fixture: ComponentFixture<PassResetComponent>;
  let component: PassResetComponent;

  const mockStore = {
    createAccount: jest.fn(),
    isRegistering: jest.fn().mockReturnValue(false),
    registerSuccess: jest.fn().mockReturnValue(false),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PassResetComponent, COMPONENTS, MODULES],
      providers: [
        { provide: firebaseAuthStore, useValue: mockStore },
        { provide: FirebaseAuthService, useValue: {} },
        provideAppInitializer(() => {
          inject(FaIconLibrary).addIcons(...FontAwesomeicons);
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PassResetComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
