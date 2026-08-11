import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Caracteristica } from '../models/caracteristica';
import { AUTH } from '../auth/auth.constants';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { buildHttpParams } from '../utils/params.util';

/**
 * @version 1.0.0
 */

@Injectable({
  providedIn: 'root'
})
export class CaracteristicaService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/caracteristicas`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener menús
   */
  getAll(filtros?: any): Observable<ApiResponseWrapper<Caracteristica[]>> {
    return this.http.get<ApiResponseWrapper<Caracteristica[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Obtener registro
   */
  get(id: string): Observable<ApiResponseWrapper<Caracteristica>> {
    return this.http.get<ApiResponseWrapper<Caracteristica>>(`${this.api}/${id}`, { headers: this.headers });
  }

  /**
   * Añadir registro
   * @param datos
   */
  addRegistro(datos: Caracteristica): Observable<ApiResponseWrapper<boolean>> {
    return this.http.post<ApiResponseWrapper<boolean>>(`${this.api}`, datos, { headers: this.headers });
  }

  /**
   * Actualizar registro
   * @param datos
   */
  updateRegistro(datos: Caracteristica): Observable<ApiResponseWrapper<boolean>> {
    return this.http.put<ApiResponseWrapper<boolean>>(`${this.api}/${datos.id}`, datos, { headers: this.headers });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponseWrapper<boolean>> {
    return this.http.patch<ApiResponseWrapper<boolean>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponseWrapper<boolean>> {
    return this.http.delete<ApiResponseWrapper<boolean>>(`${this.api}/${id}`, { headers: this.headers });
  }
}
