import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Rol } from '../models/rol';
import { AUTH } from '../auth/auth.constants';
import { ApiResponse } from '../models/apiresponse';
import { Municipio } from '../models/municipio';
import { ApiResponseWrapper } from './provincia.service';
import { buildHttpParams } from '../utils/params.util';


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
  getAll(filtros?: any): Observable<ApiResponse<Rol[]>> {
    return this.http.get<ApiResponseWrapper<Rol[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponse<Rol>> {
    return this.http.patch<ApiResponse<Municipio>>(`${this.api}/${id}`, null, { headers: this.headers });
  }
}
