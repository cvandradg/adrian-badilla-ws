import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsComponent } from './settings.component';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faSalad,faBars, faUser } from '@fortawesome/pro-solid-svg-icons';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsComponent],
    }).compileComponents();

    const library = TestBed.inject(FaIconLibrary);
    library.addIcons(faSalad);
    library.addIcons(faBars);
    library.addIcons(faUser);


    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
