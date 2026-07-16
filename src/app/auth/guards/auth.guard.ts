import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { AUTH } from '../auth.constants';

export const authGuard: CanMatchFn = (route, segments) => {

  // --- MODO PRUEBAS: Descomentar la siguiente línea ---
  return true; 
  // ----------------------------------------------------

  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Guarda la URL solicitada para volver tras el login
  const requestedUrl = '/' + segments.map(s => s.path).join('/');

  sessionStorage.setItem('redirectUrl', requestedUrl);

  return router.parseUrl(AUTH.ROUTES.LOGIN);

};