import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdrianBadillaUiDashboardComponent } from './adrian-badilla-ui-dashboard.component';

describe('AdrianBadillaUiDashboardComponent', () => {
  let component: AdrianBadillaUiDashboardComponent;
  let fixture: ComponentFixture<AdrianBadillaUiDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdrianBadillaUiDashboardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdrianBadillaUiDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
