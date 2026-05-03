import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'lib-additional-info-column',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './additional-info-column.component.html',
  styleUrl: './additional-info-column.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdditionalInfoColumnComponent {
}
