import {
  MODULES,
  COMPONENTS,
} from '@adrian-badilla/ui/shared';
import { EmailVerificationComponent } from './email-verification.component';
import { inject, provideAppInitializer } from '@angular/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { firebaseAuthStore } from '../../data-access/stores/auth.store';
import { FontAwesomeicons } from '../../../../../shared/src/lib/assets/icons/fontawesome';

jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: {},
}));

describe('EmailVerificationComponent', () => {
  let fixture: ComponentFixture<EmailVerificationComponent>;
  let component: EmailVerificationComponent;

  const mockStore = {};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        EmailVerificationComponent,
        COMPONENTS,
        MODULES,
      ],
      providers: [
        { provide: firebaseAuthStore, useValue: mockStore },
        provideAppInitializer(() => {
          inject(FaIconLibrary).addIcons(...FontAwesomeicons);
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailVerificationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
