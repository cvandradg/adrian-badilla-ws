import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { FontAwesomeicons } from '@adrian-badilla/ui/shared/assets/icons/fontawesome';
import { MODULES } from '../../../../../shared/src/lib/exports/export-modules';

@Component({
  templateUrl: './pass-reset.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule, MODULES, FontAwesomeModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PassResetComponent {}

describe('PassResetComponent', () => {
  let fixture: ComponentFixture<PassResetComponent>;
  let component: PassResetComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PassResetComponent, FontAwesomeModule],
      providers: [provideMockStore({})],
    }).compileComponents();

    // 👇 Registrar los íconos personalizados
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
