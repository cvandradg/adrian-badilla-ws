import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { COMPONENTS, MODULES } from '@adrian-badilla/ui/shared';

@Component({
  selector: 'adrian-badilla-request-pass-reset',
  templateUrl: './request-pass-reset.component.html',
  styleUrls: ['./request-pass-reset.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, MODULES, COMPONENTS],
})
export class RequestPassResetComponent {
  route = inject(ActivatedRoute);

  isPassStrong$ = new Subject<boolean>();

  log() {
    console.log('El boton funciona');

    const oobCode = this.route.snapshot.queryParamMap.get('oobCode');

    if (oobCode) {
      console.log('✔️ oobCode válido:', oobCode);
    } else if (oobCode === '') {
      console.warn('⚠️ oobCode llegó vacío. Revisar URL del correo.');
    } else if (oobCode === null) {
      console.error(
        '❌ No existe oobCode en la URL. Usuario entró manualmente o Firebase no lo envió.'
      );
    }

    console.log('oobCode recibido:', oobCode);
  }
}
