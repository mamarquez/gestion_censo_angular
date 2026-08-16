import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SessionExpiredComponent } from './session-expired/session-expired.component';
import { AccessDeniedComponent } from './access-denied/access-denied.component';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'session-expired',
    component: SessionExpiredComponent
  },
  {
    path: 'access-denied',
    component: AccessDeniedComponent
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];