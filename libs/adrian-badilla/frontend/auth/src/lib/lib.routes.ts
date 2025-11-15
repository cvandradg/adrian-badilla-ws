import { Route } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { RequestPassResetComponent } from './components/request-pass-reset/request-pass-reset.component';

export default [
  { path: 'login', component: LoginComponent },

  {
    path: 'register',
    component: RegisterComponent,
    pathMatch: 'full',
  },
] as Route[];
