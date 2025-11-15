import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeroComponent } from '../components/hero/hero.component';
import { FooterComponent } from '../components/footer/footer.component';
import { CardsComponent } from '../components/cards/cards.component';
import { GalleryComponent } from '../components/gallery/gallery.component';
import { TrainerInfoComponent } from '../components/trainer-info/trainer-info.component';
import { ReviewsComponent } from '../components/reviews/reviews.component';
import { AnnouncementComponent } from '../components/announcement/announcement.component';

@Component({
  selector: 'adrian-badilla-landing-page',
  imports: [
    HeroComponent,
    FooterComponent,
    CardsComponent,
    GalleryComponent,
    TrainerInfoComponent,
    ReviewsComponent,
    AnnouncementComponent,
  ],
  templateUrl: './adrian-badilla-ui-landing-page.component.html',
  styleUrl: './adrian-badilla-ui-landing-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPageComponent {}
