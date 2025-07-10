import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroComponent } from '../components/hero/hero.component';
import { FooterComponent } from '../components/footer/footer.component';
import { CardsComponent } from '../components/cards/cards.component';
import { GalleryComponent } from '../components/gallery/gallery.component';

@Component({
  standalone: true,
  selector: 'adrian-badilla-landing-page',
  imports: [CommonModule, HeroComponent, FooterComponent, CardsComponent, GalleryComponent],
  templateUrl: './adrian-badilla-ui-landing-page.component.html',
  styleUrl: './adrian-badilla-ui-landing-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPageComponent {}
