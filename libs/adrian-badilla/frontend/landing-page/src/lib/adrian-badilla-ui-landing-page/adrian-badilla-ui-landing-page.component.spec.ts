import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdrianBadillaUiLandingPageComponent } from './adrian-badilla-ui-landing-page.component';

describe('AdrianBadillaUiLandingPageComponent', () => {
  let component: AdrianBadillaUiLandingPageComponent;
  let fixture: ComponentFixture<AdrianBadillaUiLandingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdrianBadillaUiLandingPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdrianBadillaUiLandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
