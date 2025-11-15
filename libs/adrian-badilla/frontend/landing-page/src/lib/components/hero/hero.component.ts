import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'adrian-badilla-hero',
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
  imports: [NavbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent {}
