import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Medida } from '../models/medida';
import { AUTH } from '../auth/auth.constants';
import { ApiResponse } from '../models/apiresponse';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { buildHttpParams } from '../utils/params.util';

@Injectable({
  providedIn: 'root'
})
export class MedidaService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/medidas`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener medidas
   */
  getAll(filtros?: any): Observable<ApiResponse<Medida[]>> {
    return this.http.get<ApiResponseWrapper<Medida[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponse<Medida>> {
    return this.http.patch<ApiResponse<Medida>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponse<Medida>> {
    return this.http.delete<ApiResponse<Medida>>(`${this.api}/${id}`, { headers: this.headers });
  }
}
