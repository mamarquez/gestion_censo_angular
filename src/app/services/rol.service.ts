import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rol } from '../models/rol';
import { AUTH } from '../auth/auth.constants';
import { buildHttpParams } from '../utils/params.util';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';

/**
 * @version 1.0.1
 */

@Injectable({
  providedIn: 'root'
})
export class RolService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/roles`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener roles
   */
  getAll(filtros?: any): Observable<ApiResponseWrapper<Rol[]>> {
    return this.http.get<ApiResponseWrapper<Rol[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Obtiene un rol por su id
   * @param id Id del registro
   */
  rol(id: number): Observable<ApiResponseWrapper<Rol>> {
    return this.http.get<ApiResponseWrapper<Rol>>(`${this.api}/${id}`, { headers: this.headers });
  }

  /**
   * Crea un nuevo rol
   * @param rol Datos del rol a crear
   */
  add(rol: Partial<Rol>): Observable<ApiResponseWrapper<boolean>> {
    return this.http.post<ApiResponseWrapper<boolean>>(`${this.api}`, rol, { headers: this.headers });
  }

  /**
   * Actualiza un rol existente
   * @param id Id del registro
   * @param rol Datos actualizados del rol
   */
  update(id: number, rol: Partial<Rol>): Observable<ApiResponseWrapper<boolean>> {
    return this.http.put<ApiResponseWrapper<boolean>>(`${this.api}/${id}`, rol, { headers: this.headers });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponseWrapper<Rol>> {
    return this.http.patch<ApiResponseWrapper<Rol>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponseWrapper<boolean>> {
    return this.http.delete<ApiResponseWrapper<boolean>>(`${this.api}/${id}`, { headers: this.headers });
  }

}
