import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { COMPONENTS, MODULES } from '@adrian-badilla/ui/shared';


@Component({
  selector: 'adrian-badilla-request-pass-reset',
  templateUrl: './request-pass-reset.component.html',
  styleUrls: ['./request-pass-reset.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, MODULES, COMPONENTS],
})
export class RequestPassResetComponent {

  isPassStrong$ = new Subject<boolean>();

  log(){
    console.log('El boton funciona');
  }
}
