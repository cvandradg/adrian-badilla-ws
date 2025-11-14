import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faInstagram,
  faFacebook,
  faTiktok,
  faYoutube,
  faWhatsapp,
} from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'adrian-badilla-footer',
  imports: [FontAwesomeModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  faInstagram = faInstagram;
  faFacebook = faFacebook;
  faTiktok = faTiktok;
  faYoutube = faYoutube;
  faWhatsapp = faWhatsapp;
}
