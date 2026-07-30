import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AUTH } from '../auth/auth.constants';
import { ApiResponse } from '../models/apiresponse';
import { TipoGestorPropiedad } from '../models/TipoGestorPropiedad';
import { buildHttpParams } from '../utils/params.util';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';

@Injectable({
  providedIn: 'root'
})
export class TipoGestorPropiedadService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/tiposgestorespropiedades`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener roles
   */
  getAll(filtros?: any): Observable<ApiResponse<TipoGestorPropiedad[]>> {
    return this.http.get<ApiResponseWrapper<TipoGestorPropiedad[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponse<TipoGestorPropiedad>> {
    return this.http.patch<ApiResponse<TipoGestorPropiedad>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.api}/${id}`, { headers: this.headers });
  }

}
