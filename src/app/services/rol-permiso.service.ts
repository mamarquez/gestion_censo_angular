import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AUTH } from '../auth/auth.constants';
import { buildHttpParams } from '../utils/params.util';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { RolPermisoModel } from '../models/rol-permiso-model';
import { Rol } from '../models/rol';
import { TipoRolModel } from '../models/tipo-rol-model';

/**
 * @version 1.0.1
 */

@Injectable({
  providedIn: 'root'
})
export class RolPermisoService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/roles-permisos`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener roles
   */
  getAll(filtros?: any): Observable<ApiResponseWrapper<RolPermisoModel[]>> {
    return this.http.get<ApiResponseWrapper<RolPermisoModel[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Asigna un permiso a un rol
   * @param idRol Id del rol
   * @param idTipoRol Id del tipo de rol (permiso) a asignar
   */
  crear(idRol: number, idTipoRol: number): Observable<ApiResponseWrapper<boolean>> {
    return this.http.post<ApiResponseWrapper<boolean>>(`${this.api}`, {
      id: null,
      rol: { id: idRol } as Rol,
      tipoRol: { id: idTipoRol } as TipoRolModel
    }, { headers: this.headers });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponseWrapper<RolPermisoModel>> {
    return this.http.patch<ApiResponseWrapper<RolPermisoModel>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponseWrapper<boolean>> {
    return this.http.delete<ApiResponseWrapper<boolean>>(`${this.api}/${id}`, { headers: this.headers });
  }

}
