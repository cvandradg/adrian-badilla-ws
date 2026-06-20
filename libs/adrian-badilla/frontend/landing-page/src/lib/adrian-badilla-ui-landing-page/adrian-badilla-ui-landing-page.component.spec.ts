import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdrianBadillaUiLandingPageComponent } from './adrian-badilla-ui-landing-page.component';
import { provideRouter } from '@angular/router';

describe('AdrianBadillaUiLandingPageComponent', () => {
  let component: AdrianBadillaUiLandingPageComponent;
  let fixture: ComponentFixture<AdrianBadillaUiLandingPageComponent>;

  beforeEach(async () => {
    // The scroll engine runs in `ngAfterViewInit` and uses a few browser APIs
    // that jsdom doesn't implement. Provide minimal stubs so the component can
    // boot end-to-end under jest.
    if (!window.matchMedia) {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: false,
          media: query,
          onchange: null,
          addEventListener: () => undefined,
          removeEventListener: () => undefined,
          addListener: () => undefined,
          removeListener: () => undefined,
          dispatchEvent: () => false,
        }),
      });
    }

    if (!('IntersectionObserver' in window)) {
      class IntersectionObserverStub {
        observe(): void {
          /* no-op */
        }
        unobserve(): void {
          /* no-op */
        }
        disconnect(): void {
          /* no-op */
        }
        takeRecords(): [] {
          return [];
        }
      }
      Object.defineProperty(window, 'IntersectionObserver', {
        writable: true,
        value: IntersectionObserverStub,
      });
      (globalThis as unknown as Record<string, unknown>)['IntersectionObserver'] =
        IntersectionObserverStub;
    }

    await TestBed.configureTestingModule({
      imports: [AdrianBadillaUiLandingPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AdrianBadillaUiLandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
