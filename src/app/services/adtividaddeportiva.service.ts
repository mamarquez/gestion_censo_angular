import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ActividadDeportiva } from '../models/actividaddeportiva';
import { AUTH } from '../auth/auth.constants';
import { ApiResponse } from '../models/apiresponse';
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
  getAll(filtros?: any): Observable<ApiResponse<ActividadDeportiva[]>> {
    return this.http.get<ApiResponseWrapper<ActividadDeportiva[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponse<ActividadDeportiva>> {
    return this.http.patch<ApiResponse<ActividadDeportiva>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponse<ActividadDeportiva>> {
    return this.http.delete<ApiResponse<ActividadDeportiva>>(`${this.api}/${id}`, { headers: this.headers });
  }

}
