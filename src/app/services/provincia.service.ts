import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AUTH } from '../auth/auth.constants';
import { ApiResponse } from '../models/apiresponse';
import { Provincia } from '../models/provincia';
import { buildHttpParams } from '../utils/params.util';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';



@Injectable({
  providedIn: 'root'
})
export class ProvinciaService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/provincias`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener provincias
   */
  getAll(filtros?: any): Observable<ApiResponse<Provincia[]>> {
    return this.http.get<ApiResponseWrapper<Provincia[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponse<Provincia>> {
    return this.http.patch<ApiResponse<Provincia>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponse<Provincia>> {
    return this.http.delete<ApiResponse<Provincia>>(`${this.api}/${id}`, { headers: this.headers });
  }

}
