import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ActividadDeportiva } from '../models/actividaddeportiva';
import { AUTH } from '../auth/auth.constants';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { buildHttpParams } from '../utils/params.util';

@Injectable({
  providedIn: 'root'
})
export class ActividadDeportivaService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/actividadesdeportivas`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener actividades deportivas
   */
  getAll(filtros?: any): Observable<ApiResponseWrapper<ActividadDeportiva[]>> {
    return this.http.get<ApiResponseWrapper<ActividadDeportiva[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Obtener registro
   */
  get(id: string): Observable<ApiResponseWrapper<ActividadDeportiva>> {
    return this.http.get<ApiResponseWrapper<ActividadDeportiva>>(`${this.api}/${id}`, { headers: this.headers });
  }

  /**
   * Añadir registro
   * @param datos
   */
  addRegistro(datos: ActividadDeportiva): Observable<ApiResponseWrapper<boolean>> {
    return this.http.post<ApiResponseWrapper<boolean>>(`${this.api}`, datos, { headers: this.headers });
  }

  /**
   * Actualizar registro
   * @param datos
   */
  updateRegistro(datos: ActividadDeportiva): Observable<ApiResponseWrapper<boolean>> {
    return this.http.put<ApiResponseWrapper<boolean>>(`${this.api}/${datos.id}`, datos, { headers: this.headers });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponseWrapper<ActividadDeportiva>> {
    return this.http.patch<ApiResponseWrapper<ActividadDeportiva>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponseWrapper<ActividadDeportiva>> {
    return this.http.delete<ApiResponseWrapper<ActividadDeportiva>>(`${this.api}/${id}`, { headers: this.headers });
  }

}
