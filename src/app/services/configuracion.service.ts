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
   * Obtener registros
   */
  getAll(filtros?: any): Observable<ApiResponseWrapper<Configuracion[]>> {
    return this.http.get<ApiResponseWrapper<Configuracion[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Obtener registro
   */
  get(id: string): Observable<ApiResponseWrapper<Configuracion>> {
    return this.http.get<ApiResponseWrapper<Configuracion>>(`${this.api}/${id}`, { headers: this.headers });
  }

  /**
   * Añadir registro
   */
  addRegistro(datos: Configuracion): Observable<ApiResponseWrapper<boolean>> {
    return this.http.post<ApiResponseWrapper<boolean>>(`${this.api}`, datos, { headers: this.headers });
  }

  /**
   * Actualizar registro
   */
  updateRegistro(datos: Configuracion): Observable<ApiResponseWrapper<boolean>> {
    return this.http.put<ApiResponseWrapper<boolean>>(`${this.api}/${datos.id}`, datos, { headers: this.headers });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponseWrapper<Configuracion>> {
    return this.http.patch<ApiResponseWrapper<Configuracion>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponseWrapper<Configuracion>> {
    return this.http.delete<ApiResponseWrapper<Configuracion>>(`${this.api}/${id}`, { headers: this.headers });
  }

}
