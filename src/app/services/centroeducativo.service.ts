import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { CentroEducativo } from '../models/centroeducativo';
import { AUTH } from '../auth/auth.constants';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { buildHttpParams } from '../utils/params.util';

@Injectable({
  providedIn: 'root'
})
export class CentroEducativoService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/centroseducativos`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener centros educativos
   */
  getAll(filtros?: any): Observable<ApiResponseWrapper<CentroEducativo[]>> {
    return this.http.get<ApiResponseWrapper<CentroEducativo[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponseWrapper<CentroEducativo>> {
    return this.http.patch<ApiResponseWrapper<CentroEducativo>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponseWrapper<CentroEducativo>> {
    return this.http.delete<ApiResponseWrapper<CentroEducativo>>(`${this.api}/${id}`, { headers: this.headers });
  }

}
