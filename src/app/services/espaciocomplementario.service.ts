import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { EspacioComplementario } from '../models/espaciocomplementario';
import { AUTH } from '../auth/auth.constants';
import { ApiResponse } from '../models/apiresponse';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { buildHttpParams } from '../utils/params.util';

@Injectable({
  providedIn: 'root'
})
export class EspacioComplementarioService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/espacioscomplementarios`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener espacios complementarios
   */
  getAll(filtros?: any): Observable<ApiResponseWrapper<EspacioComplementario[]>> {
    return this.http.get<ApiResponseWrapper<EspacioComplementario[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Obtener registro
   * @param id Id del registro
   */
  get(id: number): Observable<ApiResponseWrapper<EspacioComplementario[]>> {
    return this.http.get<ApiResponseWrapper<EspacioComplementario[]>>(`${this.api}/${id}`, {
      headers: this.headers
    });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponseWrapper<EspacioComplementario>> {
    return this.http.patch<ApiResponseWrapper<EspacioComplementario>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponseWrapper<EspacioComplementario>> {
    return this.http.delete<ApiResponseWrapper<EspacioComplementario>>(`${this.api}/${id}`, { headers: this.headers });
  }
}
