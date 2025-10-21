import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdrianBadillaUiAuthComponent } from './adrian-badilla-ui-auth.component';

describe('AdrianBadillaUiAuthComponent', () => {
  let component: AdrianBadillaUiAuthComponent;
  let fixture: ComponentFixture<AdrianBadillaUiAuthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdrianBadillaUiAuthComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdrianBadillaUiAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
