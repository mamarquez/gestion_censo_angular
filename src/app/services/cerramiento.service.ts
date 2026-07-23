import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AUTH } from '../auth/auth.constants';
import { Cerramiento } from '../models/cerramiento';
import { ApiResponse } from '../models/apiresponse';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { buildHttpParams } from '../utils/params.util';


@Injectable({
  providedIn: 'root'
})
export class CerramientoService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/cerramientos`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener cerramientos
   */
  getAll(filtros?: any): Observable<ApiResponse<Cerramiento[]>> {
    return this.http.get<ApiResponseWrapper<Cerramiento[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponse<Cerramiento>> {
    return this.http.patch<ApiResponse<Cerramiento>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponse<Cerramiento>> {
    return this.http.delete<ApiResponse<Cerramiento>>(`${this.api}/${id}`, { headers: this.headers });
  }
}
