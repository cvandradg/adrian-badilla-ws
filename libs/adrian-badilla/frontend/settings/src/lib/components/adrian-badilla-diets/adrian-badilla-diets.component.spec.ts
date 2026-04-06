import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdrianBadillaDietsComponent } from './adrian-badilla-diets.component';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

describe('AdrianBadillaDietsComponent', () => {
  let component: AdrianBadillaDietsComponent;
  let fixture: ComponentFixture<AdrianBadillaDietsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdrianBadillaDietsComponent],
    }).compileComponents();

    const library = TestBed.inject(FaIconLibrary);
    library.addIcons(faUser);
    fixture = TestBed.createComponent(AdrianBadillaDietsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
