import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Municipio } from '../models/municipio';
import { AUTH } from '../auth/auth.constants';
import { ApiResponse } from '../models/apiresponse';
import { ApiResponseWrapper } from './provincia.service';
import { buildHttpParams } from '../utils/params.util';


@Injectable({
  providedIn: 'root'
})
export class MunicipioService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/municipios`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener municipios
   */
  getAll(filtros?: any): Observable<ApiResponse<Municipio[]>> {
    return this.http.get<ApiResponseWrapper<Municipio[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponse<Municipio>> {
    return this.http.patch<ApiResponse<Municipio>>(`${this.api}/${id}`, null, { headers: this.headers });
  }
}
