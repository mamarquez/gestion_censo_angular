import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { LoginRequest } from '../models/login-request';
import { LoginResponse } from '../models/login-response';
import { ForgotPasswordRequest } from '../models/forgot-password-request';
import { ResetPasswordRequest } from '../models/reset-password-request';
import { ChangePasswordRequest } from '../models/change-password-request';

import { AUTH } from '../auth.constants';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);

  private readonly api = AUTH.API;

  login(request: LoginRequest): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(
      `${this.api}/login`,
      request
    );

  }

  forgotPassword(request: ForgotPasswordRequest): Observable<void> {

    return this.http.post<void>(
      `${this.api}/forgot-password`,
      request
    );

  }

  resetPassword(request: ResetPasswordRequest): Observable<void> {

    return this.http.post<void>(
      `${this.api}/reset-password`,
      request
    );

  }

  changePassword(request: ChangePasswordRequest): Observable<void> {

    return this.http.post<void>(
      `${this.api}/change-password`,
      request
    );

  }

  refreshToken(refreshToken: string): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(
      `${this.api}/refresh-token`,
      {
        refreshToken
      }
    );

  }

  logout(): void {
    this.tokenService.clear();
  }

  saveSession(response: LoginResponse): void {

    this.tokenService.save(response.token);

    sessionStorage.setItem(
      AUTH.REFRESH_TOKEN,
      response.refreshToken
    );

    localStorage.setItem(
      AUTH.USER,
      JSON.stringify(response)
    );

  }

  getUser(): LoginResponse | null {

    const user = localStorage.getItem(AUTH.USER);

    return user
      ? JSON.parse(user)
      : null;

  }

  isAuthenticated(): boolean {

    return this.tokenService.isLogged();

  }

}
