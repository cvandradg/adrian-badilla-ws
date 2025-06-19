import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'adrian-badilla-hero',
  standalone: true,
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
  imports: [CommonModule, NavbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent {}

