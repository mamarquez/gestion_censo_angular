import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Pavimento } from '../models/pavimento';
import { AUTH } from '../auth/auth.constants';
import { ApiResponse } from '../models/apiresponse';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { buildHttpParams } from '../utils/params.util';


@Injectable({
  providedIn: 'root'
})
export class PavimentoService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/pavimentos`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener pavimentos
   */
  getAll(filtros?: any): Observable<ApiResponse<Pavimento[]>> {
    return this.http.get<ApiResponseWrapper<Pavimento[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponse<Pavimento>> {
    return this.http.patch<ApiResponse<Pavimento>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponse<Pavimento>> {
    return this.http.delete<ApiResponse<Pavimento>>(`${this.api}/${id}`, { headers: this.headers });
  }
}
