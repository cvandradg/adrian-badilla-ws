import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdditionalInfoColumnComponent } from './additional-info-column.component';

describe('AdditionalInfoColumnComponent', () => {
  let component: AdditionalInfoColumnComponent;
  let fixture: ComponentFixture<AdditionalInfoColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdditionalInfoColumnComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdditionalInfoColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
