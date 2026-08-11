import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AUTH } from '../auth/auth.constants';
import { TipoGestorPropiedad } from '../models/tipogestorpropiedad';
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
  getAll(filtros?: any): Observable<ApiResponseWrapper<TipoGestorPropiedad[]>> {
    return this.http.get<ApiResponseWrapper<TipoGestorPropiedad[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Obtener nivel educativo
   */
  get(id: string): Observable<ApiResponseWrapper<TipoGestorPropiedad>> {
    return this.http.get<ApiResponseWrapper<TipoGestorPropiedad>>(`${this.api}/${id}`, { headers: this.headers });
  }

  /**
   * Añade el registro
   * @param datos
   */
  addRegistro(datos: TipoGestorPropiedad): Observable<ApiResponseWrapper<boolean>> {
    return this.http.post<ApiResponseWrapper<boolean>>(`${this.api}`, datos, { headers: this.headers });
  }

  /**
   * Actualiza el registro
   * @param datos
   */
  updateRegistro(datos: TipoGestorPropiedad): Observable<ApiResponseWrapper<boolean>> {
    return this.http.put<ApiResponseWrapper<boolean>>(`${this.api}/${datos.id}`, datos, { headers: this.headers });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponseWrapper<TipoGestorPropiedad>> {
    return this.http.patch<ApiResponseWrapper<TipoGestorPropiedad>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponseWrapper<boolean>> {
    return this.http.delete<ApiResponseWrapper<boolean>>(`${this.api}/${id}`, { headers: this.headers });
  }

}
