import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AdditionalInfoColumnComponent } from '../additional-info-column/additional-info-column.component';

@Component({
  selector: 'lib-settings',
  imports: [AdditionalInfoColumnComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {}
