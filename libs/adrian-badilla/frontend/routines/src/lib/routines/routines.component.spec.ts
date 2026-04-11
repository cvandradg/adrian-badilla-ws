import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoutinesComponent } from './routines.component';

describe('RoutinesComponent', () => {
  let component: RoutinesComponent;
  let fixture: ComponentFixture<RoutinesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoutinesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RoutinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the routines title', () => {
    const content = fixture.nativeElement.textContent;

    expect(content).toContain('Rutinas');
    expect(content).toContain('Plan semanal sincronizado');
  });
});
