import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdrianBadillaDietsDecisionComponent } from './adrian-badilla-diets-decision.component';

describe('AdrianBadillaDietsDecisionComponent', () => {
  let component: AdrianBadillaDietsDecisionComponent;
  let fixture: ComponentFixture<AdrianBadillaDietsDecisionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdrianBadillaDietsDecisionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdrianBadillaDietsDecisionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
