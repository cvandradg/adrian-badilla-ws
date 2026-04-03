import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdrianBadillaDietsComponent } from './adrian-badilla-diets.component';

describe('AdrianBadillaDietsComponent', () => {
  let component: AdrianBadillaDietsComponent;
  let fixture: ComponentFixture<AdrianBadillaDietsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdrianBadillaDietsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdrianBadillaDietsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
