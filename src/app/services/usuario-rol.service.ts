import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AUTH } from '../auth/auth.constants';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { buildHttpParams } from '../utils/params.util';
import { RolesUsuarioModel } from '../models/roles-usuario-model';

/**
 * @version 1.0.1
 */

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/usuarios-roles`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener registros
   */
  getAll(filtros?: any): Observable<ApiResponseWrapper<RolesUsuarioModel[]>> {
    return this.http.get<ApiResponseWrapper<RolesUsuarioModel[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Devuelve el registro
   * @param id Id del registro
   */
  get(id: string) {
    return this.http.get<ApiResponseWrapper<RolesUsuarioModel>>(`${this.api}/${id}`, {
      headers: this.headers
    });
  }

  /**
   * Actualiza los datos de un usuario
   * @param id Id del registro
   * @param usuario Datos a actualizar
   */
  update(id: string, usuario: RolesUsuarioModel): Observable<ApiResponseWrapper<boolean>> {
    return this.http.put<ApiResponseWrapper<boolean>>(`${this.api}/${id}`, usuario, { headers: this.headers });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: string): Observable<ApiResponseWrapper<boolean>> {
    return this.http.patch<ApiResponseWrapper<boolean>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: string): Observable<ApiResponseWrapper<boolean>> {
    return this.http.delete<ApiResponseWrapper<boolean>>(`${this.api}/${id}`, { headers: this.headers });
  }
}
