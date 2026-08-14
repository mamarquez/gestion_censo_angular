import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AUTH } from '../auth/auth.constants';
import { buildHttpParams } from '../utils/params.util';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { TipoRolModel } from '../models/tipo-rol-model';

@Injectable({
  providedIn: 'root'
})
export class TipoRolService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/tiposroles`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener catálogo de tipos de rol (permisos disponibles)
   */
  getAll(filtros?: any): Observable<ApiResponseWrapper<TipoRolModel[]>> {
    return this.http.get<ApiResponseWrapper<TipoRolModel[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }
}
