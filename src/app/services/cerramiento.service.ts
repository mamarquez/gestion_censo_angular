import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AUTH } from '../auth/auth.constants';
import { Cerramiento } from '../models/cerramiento';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { buildHttpParams } from '../utils/params.util';

/**
 * @version 1.0.0
 */

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
  getAll(filtros?: any): Observable<ApiResponseWrapper<Cerramiento[]>> {
    return this.http.get<ApiResponseWrapper<Cerramiento[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Obtener registro
   */
  get(id: string): Observable<ApiResponseWrapper<Cerramiento>> {
    return this.http.get<ApiResponseWrapper<Cerramiento>>(`${this.api}/${id}`, { headers: this.headers });
  }

  /**
   * Añadir registro
   * @param datos
   */
  addRegistro(datos: Cerramiento): Observable<ApiResponseWrapper<boolean>> {
    return this.http.post<ApiResponseWrapper<boolean>>(`${this.api}`, datos, { headers: this.headers });
  }

  /**
   * Actualizar registro
   * @param datos
   */
  updateRegistro(datos: Cerramiento): Observable<ApiResponseWrapper<boolean>> {
    return this.http.put<ApiResponseWrapper<boolean>>(`${this.api}/${datos.id}`, datos, { headers: this.headers });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponseWrapper<Cerramiento>> {
    return this.http.patch<ApiResponseWrapper<Cerramiento>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponseWrapper<Cerramiento>> {
    return this.http.delete<ApiResponseWrapper<Cerramiento>>(`${this.api}/${id}`, { headers: this.headers });
  }
}
