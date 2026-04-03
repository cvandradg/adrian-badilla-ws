import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DescriptionSidePanelComponent } from './description-side-panel.component';

describe('DescriptionSidePanelComponent', () => {
  let component: DescriptionSidePanelComponent;
  let fixture: ComponentFixture<DescriptionSidePanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DescriptionSidePanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DescriptionSidePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
