import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AUTH } from '../auth/auth.constants';
import { TipoInstalacion } from '../models/tipo-instalacion';
import { buildHttpParams } from '../utils/params.util';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';

@Injectable({
  providedIn: 'root'
})
export class TipoInstalacionService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/tiposinstalaciones`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener tipos de instalación
   */
  getAll(filtros?: any): Observable<ApiResponseWrapper<TipoInstalacion[]>> {
    return this.http.get<ApiResponseWrapper<TipoInstalacion[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Obtener tipo de instalación
   */
  get(id: string): Observable<ApiResponseWrapper<TipoInstalacion>> {
    return this.http.get<ApiResponseWrapper<TipoInstalacion>>(`${this.api}/${id}`, { headers: this.headers });
  }

  /**
   * Añade el registro
   * @param datos
   */
  addRegistro(datos: TipoInstalacion): Observable<ApiResponseWrapper<boolean>> {
    return this.http.post<ApiResponseWrapper<boolean>>(`${this.api}`, datos, { headers: this.headers });
  }

  /**
   * Actualiza el registro
   * @param datos
   */
  updateRegistro(datos: TipoInstalacion): Observable<ApiResponseWrapper<boolean>> {
    return this.http.put<ApiResponseWrapper<boolean>>(`${this.api}/${datos.id}`, datos, { headers: this.headers });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponseWrapper<TipoInstalacion>> {
    return this.http.patch<ApiResponseWrapper<TipoInstalacion>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponseWrapper<boolean>> {
    return this.http.delete<ApiResponseWrapper<boolean>>(`${this.api}/${id}`, { headers: this.headers });
  }

}
