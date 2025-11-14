import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { COMPONENTS, MODULES } from '@adrian-badilla/ui/shared';
import { firebaseAuthStore } from '../../data-access/stores/auth.store';

@Component({
  selector: 'adrian-badilla-request-pass-reset',
  templateUrl: './request-pass-reset.component.html',
  styleUrls: ['./request-pass-reset.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, MODULES, COMPONENTS],
})
export class RequestPassResetComponent implements OnInit {
  firebaseAuthStore = inject(firebaseAuthStore);

  isPassStrong$ = new Subject<boolean>();

  ngOnInit() {
    this.firebaseAuthStore.initOobCode();
  }

}
