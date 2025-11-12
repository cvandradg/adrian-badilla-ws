import { Component, inject, Input } from '@angular/core';
import { COMPONENTS, MODULES } from '@adrian-badilla/ui/shared';
import { firebaseAuthStore } from '../../data-access/stores/auth.store';

@Component({
  selector: 'adrian-badilla-pass-reset',
  templateUrl: './pass-reset.component.html',
  styleUrls: ['./pass-reset.component.scss'],
  imports: [MODULES, COMPONENTS],
})
export class PassResetComponent {
    firebaseAuthStore = inject(firebaseAuthStore);

  @Input()
  public user!: string;

  onResetClick() {
    console.log('Botón de recuperar contraseña funcionando');
  }
}
