import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  templateUrl: './trainer-info.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class TrainerInfoComponent {}

describe('TrainerInfoComponent', () => {
  let component: TrainerInfoComponent;
  let fixture: ComponentFixture<TrainerInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainerInfoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TrainerInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
