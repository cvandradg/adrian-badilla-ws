import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FoodDescriptionDialogComponent } from './food-description-dialog.component';

describe('FoodDescriptionDialogComponent', () => {
  let component: FoodDescriptionDialogComponent;
  let fixture: ComponentFixture<FoodDescriptionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoodDescriptionDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FoodDescriptionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
