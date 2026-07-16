import { Injectable } from '@angular/core';
import { AUTH } from '../auth.constants';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  save(token: string): void {

    localStorage.setItem(AUTH.TOKEN, token);

  }

  get(): string | null {

    return localStorage.getItem(AUTH.TOKEN);

  }

  getRefreshToken(): string | null {

    return localStorage.getItem(AUTH.REFRESH_TOKEN);

  }

  remove(): void {

    localStorage.removeItem(AUTH.TOKEN);

    localStorage.removeItem(AUTH.REFRESH_TOKEN);

    localStorage.removeItem(AUTH.USER);

  }

  clear(): void {

    localStorage.clear();

  }

  isLogged(): boolean {

    return !!this.get();

  }

}