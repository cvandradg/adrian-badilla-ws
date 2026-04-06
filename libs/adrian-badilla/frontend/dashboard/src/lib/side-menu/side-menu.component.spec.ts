import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SideMenuComponent } from './side-menu.component';
import { provideRouter, RouterModule } from '@angular/router';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faTelescope, faBars } from '@fortawesome/pro-solid-svg-icons';
import { faBicep } from '@fortawesome/pro-regular-svg-icons';

describe('SideMenuComponent', () => {
  let component: SideMenuComponent;
  let fixture: ComponentFixture<SideMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideMenuComponent, RouterModule],
      providers: [provideRouter([])],

    }).compileComponents();

        const library = TestBed.inject(FaIconLibrary);
    library.addIcons(faTelescope);
    library.addIcons(faBars);
    library.addIcons(faBicep);



    fixture = TestBed.createComponent(SideMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
