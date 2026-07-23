import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Auditoria } from '../models/auditoria';
import { AUTH } from '../auth/auth.constants';
import { ApiResponse } from '../models/apiresponse';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { buildHttpParams } from '../utils/params.util';

@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/auditorias`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener registros
   */
  getAll(filtros?: any): Observable<ApiResponse<Auditoria[]>> {
    return this.http.get<ApiResponseWrapper<Auditoria[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Obtiene el registro
   * @param id Id del registro
   */
  get(id: number) : Observable<ApiResponse<Auditoria[]>> {
    return this.http.get<ApiResponseWrapper<Auditoria[]>>(`${this.api}/${id}`, {
      headers: this.headers
    });
  }

}
