import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdrianBadillaDietsDetailsComponent } from './adrian-badilla-diets-details.component';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faUser } from '@fortawesome/pro-solid-svg-icons';


describe('AdrianBadillaDietsDetailsComponent', () => {
  let component: AdrianBadillaDietsDetailsComponent;
  let fixture: ComponentFixture<AdrianBadillaDietsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdrianBadillaDietsDetailsComponent],
    }).compileComponents();

    const library = TestBed.inject(FaIconLibrary);
    library.addIcons(faUser);


    fixture = TestBed.createComponent(AdrianBadillaDietsDetailsComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('routes', [{ id: '1', name: 'Ruta 1' }]);

    fixture.componentRef.setInput('selectedRouteId', '1');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
