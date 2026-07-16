import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { catchError, throwError } from 'rxjs';

import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';

import { AUTH } from '../auth.constants';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const tokenService = inject(TokenService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const isPublic = AUTH.PUBLIC_ENDPOINTS.some(endpoint =>
    req.url.includes(endpoint)
  );

  let request = req;

  if (!isPublic) {

    const token = tokenService.get();

    if (token) {
      request = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

  }

  return next(request).pipe(
    catchError(error => {

      switch (error.status) {

        case 401:
          authService.logout();
          router.navigateByUrl(AUTH.ROUTES.SESSION_EXPIRED);
          break;

        case 403:
          router.navigateByUrl(AUTH.ROUTES.ACCESS_DENIED);
          break;

      }

      return throwError(() => error);

    })
  );

};