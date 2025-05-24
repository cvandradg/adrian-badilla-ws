import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroComponent } from '../components/hero/hero.component';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { FooterComponent } from '../components/footer/footer.component';
import { CardsComponent } from '../components/cards/cards.component';

@Component({
  standalone: true,
  selector: 'adrian-badilla-landing-page',
  imports: [CommonModule, HeroComponent, NavbarComponent, FooterComponent, CardsComponent],
  templateUrl: './adrian-badilla-ui-landing-page.component.html',
  styleUrl: './adrian-badilla-ui-landing-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPageComponent {}
