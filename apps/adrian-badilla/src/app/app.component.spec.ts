import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { settingsStoreDev } from 'adrian-badilla/settings';
import { FabLayoutStore } from 'adrian-badilla/settings';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterModule.forRoot([])],
      providers: [
        {
          provide: settingsStoreDev,
          useValue: {
            remainingMacros: () => null,
          },
        },
        {
          provide: FabLayoutStore,
          useValue: {
            fabBaseBottom: () => 0,
          },
        },
      ],
    }).compileComponents();
  });

  it(`should have as title 'adrian-badilla'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('adrian-badilla');
  });
});
