import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Configuracion } from '../models/configuracion';
import { AUTH } from '../auth/auth.constants';
import { ApiResponse } from '../models/apiresponse';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { buildHttpParams } from '../utils/params.util';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/configuraciones`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener menús
   */
  getAll(filtros?: any): Observable<ApiResponse<Configuracion[]>> {
    return this.http.get<ApiResponseWrapper<Configuracion[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponse<Configuracion>> {
    return this.http.patch<ApiResponse<Configuracion>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponse<Configuracion>> {
    return this.http.delete<ApiResponse<Configuracion>>(`${this.api}/${id}`, { headers: this.headers });
  }

}
