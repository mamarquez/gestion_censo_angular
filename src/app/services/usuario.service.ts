import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Usuario } from '../models/usuario';
import { AUTH } from '../auth/auth.constants';
import { ApiResponse } from '../models/apiresponse';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { buildHttpParams } from '../utils/params.util';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/usuarios`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener provincias
   */
  getAll(filtros?: any): Observable<ApiResponseWrapper<Usuario[]>> {
    return this.http.get<ApiResponseWrapper<Usuario[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Devuelve el registro
   * @param id Id del registro
   */
  get(id: string) {
    return this.http.get<ApiResponseWrapper<Usuario>>(`${this.api}/${id}`, {
      headers: this.headers
    });
  }

  /**
   * Actualiza los datos de un usuario
   * @param id Id del registro
   * @param usuario Datos a actualizar
   */
  update(id: string, usuario: Partial<Usuario>): Observable<ApiResponse<Usuario>> {
    return this.http.put<ApiResponse<Usuario>>(`${this.api}/${id}`, usuario, { headers: this.headers });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: string): Observable<ApiResponse<Usuario>> {
    return this.http.patch<ApiResponse<Usuario>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: string): Observable<ApiResponse<Usuario>> {
    return this.http.delete<ApiResponse<Usuario>>(`${this.api}/${id}`, { headers: this.headers });
  }
}
