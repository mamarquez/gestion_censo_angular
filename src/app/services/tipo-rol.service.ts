import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AUTH } from '../auth/auth.constants';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { TipoRolModel } from '../models/tipo-rol-model';

@Injectable({
  providedIn: 'root'
})
export class TipoRolService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/roles-tipos`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener catálogo completo de tipos de rol (permisos disponibles para asignar a un rol).
   */
  getAll(): Observable<ApiResponseWrapper<TipoRolModel[]>> {
    return this.http.get<ApiResponseWrapper<TipoRolModel[]>>(`${this.api}`, { headers: this.headers });
  }
}
