import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdrianBadillaUiSharedComponent } from './adrian-badilla-ui-shared.component';

describe('AdrianBadillaUiSharedComponent', () => {
  let component: AdrianBadillaUiSharedComponent;
  let fixture: ComponentFixture<AdrianBadillaUiSharedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdrianBadillaUiSharedComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdrianBadillaUiSharedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
