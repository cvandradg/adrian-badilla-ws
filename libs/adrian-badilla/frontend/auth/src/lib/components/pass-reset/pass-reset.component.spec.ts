import { PassResetComponent } from './pass-reset.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { FontAwesomeicons } from '@adrian-badilla/ui/shared/assets/icons/fontawesome';

jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: {},
}));
describe('PassResetComponent', () => {
  let fixture: ComponentFixture<PassResetComponent>;
  let component: PassResetComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PassResetComponent, FontAwesomeModule],
    }).compileComponents();

    const library = TestBed.inject(FaIconLibrary);
    library.addIcons(...FontAwesomeicons);

    fixture = TestBed.createComponent(PassResetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
