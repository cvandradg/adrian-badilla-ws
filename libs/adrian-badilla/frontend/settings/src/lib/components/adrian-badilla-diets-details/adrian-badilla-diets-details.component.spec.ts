import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdrianBadillaDietsDetailsComponent } from './adrian-badilla-diets-details.component';

describe('AdrianBadillaDietsDetailsComponent', () => {
  let component: AdrianBadillaDietsDetailsComponent;
  let fixture: ComponentFixture<AdrianBadillaDietsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdrianBadillaDietsDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdrianBadillaDietsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
