import {
  MODULES,
  COMPONENTS,
  FirebaseAuthService,
} from '@adrian-badilla/ui/shared';
import { RegisterComponent } from './register.component';
import { inject, provideAppInitializer } from '@angular/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { firebaseAuthStore } from '../../data-access/stores/auth.store';
import { FontAwesomeicons } from '../../../../../shared/src/lib/assets/icons/fontawesome';

jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: {},
}));

describe('RegisterComponent', () => {
  let fixture: ComponentFixture<RegisterComponent>;
  let component: RegisterComponent;

  const mockStore = {
    createAccount: jest.fn(),
    isRegistering: jest.fn().mockReturnValue(false),
    registerSuccess: jest.fn().mockReturnValue(false),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent, COMPONENTS, MODULES],
      providers: [
        { provide: firebaseAuthStore, useValue: mockStore },
        { provide: FirebaseAuthService, useValue: {} },
        provideAppInitializer(() => {
          inject(FaIconLibrary).addIcons(...FontAwesomeicons);
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
