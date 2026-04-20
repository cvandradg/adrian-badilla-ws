import { ComponentFixture, TestBed } from '@angular/core/testing';
import { inject, provideAppInitializer } from '@angular/core';
import Aura from '@primeng/themes/aura';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { providePrimeNG } from 'primeng/config';
import { FontAwesomeicons } from '@adrian-badilla/ui/shared/assets/icons/fontawesome';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { RoutinesComponent } from './routines.component';

class ResizeObserverMock {
  constructor(_callback: ResizeObserverCallback) {}

  observe(_target: Element): void {}

  unobserve(_target: Element): void {}

  disconnect(): void {}
}

describe('RoutinesComponent', () => {
  let component: RoutinesComponent;
  let fixture: ComponentFixture<RoutinesComponent>;

  beforeAll(() => {
    Object.defineProperty(globalThis, 'ResizeObserver', {
      configurable: true,
      writable: true,
      value: ResizeObserverMock,
    });
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoutinesComponent],
      providers: [
        provideAnimationsAsync(),
        providePrimeNG({
          ripple: true,
          theme: {
            preset: Aura,
          },
        }),
        provideAppInitializer(() => {
          inject(FaIconLibrary).addIcons(...FontAwesomeicons);
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RoutinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the routines title', () => {
    const content = fixture.nativeElement.textContent;

    expect(content).toContain('Rutinas');
    expect(content).toContain('Modificaciones de Rutinas');
    expect(content).toContain('Rutinas disponibles');
    expect(content).toContain('Sentadilla Smith');
    expect(content).toContain('Espalda, brazos y hombros');
  });
});
