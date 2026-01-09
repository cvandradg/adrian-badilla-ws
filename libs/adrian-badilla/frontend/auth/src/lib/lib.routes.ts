import { Route } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { RequestPassResetComponent } from './components/request-pass-reset/request-pass-reset.component';
import { EmailVerificationComponent } from './components/email-verification/email-verification.component';

export default [
  { path: 'login', component: LoginComponent },

  {
    path: 'register',
    component: RegisterComponent,
    pathMatch: 'full',
  },
  {
    path: 'request-pass-reset',
    component: RequestPassResetComponent,
    pathMatch: 'full',
  },
  {
    path: 'email-verification',
    component: EmailVerificationComponent,
    pathMatch: 'full',
  },

] as Route[];
