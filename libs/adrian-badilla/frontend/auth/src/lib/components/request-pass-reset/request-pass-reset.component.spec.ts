import { CommonModule } from '@angular/common';
import { RouterModule, provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  FontAwesomeModule,
  FaIconLibrary,
} from '@fortawesome/angular-fontawesome';
import { FontAwesomeicons } from '@adrian-badilla/ui/shared/assets/icons/fontawesome';
import { RequestPassResetComponent } from './request-pass-reset.component';

jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: {},
}));

describe('RequestPassResetComponent', () => {
  let fixture: ComponentFixture<RequestPassResetComponent>;
  let component: RequestPassResetComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterModule,
        FontAwesomeModule,
        RequestPassResetComponent,
      ],
      providers: [provideRouter([])],
    }).compileComponents();

    const library = TestBed.inject(FaIconLibrary);
    library.addIcons(...FontAwesomeicons);

    fixture = TestBed.createComponent(RequestPassResetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
