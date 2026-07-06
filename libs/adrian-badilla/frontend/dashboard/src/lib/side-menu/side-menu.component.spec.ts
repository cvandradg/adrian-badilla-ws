import { inject, provideAppInitializer, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { SideMenuComponent } from './side-menu.component';
import { FontAwesomeicons } from '../../../../shared/src/lib/assets/icons/fontawesome';
import { FirebaseAuthService } from '@adrian-badilla/ui/shared';

describe('SideMenuComponent', () => {
  let component: SideMenuComponent;
  let fixture: ComponentFixture<SideMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideMenuComponent],
      providers: [
        provideRouter([]),
        provideAppInitializer(() => {
          inject(FaIconLibrary).addIcons(...FontAwesomeicons);
        }),
        {
          provide: FirebaseAuthService,
          useValue: {
            currentUser: signal(null),
            user$: { subscribe: jest.fn() },
            authState$: { subscribe: jest.fn() },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SideMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
