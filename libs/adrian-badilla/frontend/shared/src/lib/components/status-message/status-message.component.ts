import { MODULES } from '../../exports/export-modules';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NothingOr } from '../../types/general-types';

@Component({
  selector: 'adrian-badilla-status-message',
  templateUrl: './status-message.component.html',
  styleUrls: ['./status-message.component.scss'],
  imports: [MODULES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusMessageComponent {
  readonly icon = input<IconProp>(['fas', 'user']);
  readonly display = input<NothingOr<boolean>>(false);
  readonly message = input<NothingOr<string>>('Some Text');
  readonly type = input<'success' | 'error' | 'warning' | 'info'>('error');
}
