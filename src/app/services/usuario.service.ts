import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Usuario } from '../models/usuario';
import { AUTH } from '../auth/auth.constants';
import { ApiResponse } from '../models/apiresponse';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { Gestor } from '../models/gestor';
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
   * Obtener todos las usuario
   */
  getAll(filtros?: any): Observable<ApiResponse<Usuario[]>> {
     return this.http.get<ApiResponseWrapper<Usuario[]>>(`${this.api}`, {
       params: buildHttpParams(filtros),
       headers: this.headers
     });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponse<Usuario>> {
    return this.http.patch<ApiResponse<Usuario>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponse<Usuario>> {
    return this.http.delete<ApiResponse<Usuario>>(`${this.api}/${id}`, { headers: this.headers });
  }
}
