import { Injectable } from '@angular/core';
import { AUTH } from '../auth.constants';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  save(token: string): void {
    sessionStorage.setItem(AUTH.TOKEN, token);
  }

  get(): string | null {
    return sessionStorage.getItem(AUTH.TOKEN);
  }

  getRefreshToken(): string | null {
    return sessionStorage.getItem(AUTH.REFRESH_TOKEN);
  }

  remove(): void {
    sessionStorage.removeItem(AUTH.TOKEN);
    sessionStorage.removeItem(AUTH.REFRESH_TOKEN);
    sessionStorage.removeItem(AUTH.USER);
  }

  clear(): void {
    sessionStorage.clear();
  }

  isLogged(): boolean {
    return !this.isExpired();
  }

  isExpired(token: string | null = this.get()): boolean {

    if (!token) {
      return true;
    }

    const payload = this.decodePayload(token);

    if (!payload?.exp) {
      return true;
    }

    return Date.now() >= payload.exp * 1000;

  }

  private decodePayload(token: string): { exp?: number } | null {

    try {

      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

      return JSON.parse(atob(base64));

    } catch {
      return null;
    }

  }

}