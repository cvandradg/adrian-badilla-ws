import { Component, Input } from '@angular/core';
import { COMPONENTS, MODULES } from '@adrian-badilla/ui/shared';

@Component({
  selector: 'adrian-badilla-pass-reset',
  templateUrl: './pass-reset.component.html',
  styleUrls: ['./pass-reset.component.scss'],
  imports: [MODULES, COMPONENTS],
})
export class PassResetComponent {
  @Input()
  public user!: string;

}
