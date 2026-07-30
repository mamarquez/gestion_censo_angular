import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { EspacioDeportivo } from '../models/espaciodeportivo';
import { AUTH } from '../auth/auth.constants';
import { ApiResponse } from '../models/apiresponse';
import { NivelEducativo } from '../models/niveleducativo';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { buildHttpParams } from '../utils/params.util';


@Injectable({
  providedIn: 'root'
})
export class EspacioDeportivoService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/espaciosdeportivos`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener todos los niveles educativos
   */
  getAll(filtros?: any): Observable<ApiResponse<EspacioDeportivo[]>> {
    return this.http.get<ApiResponseWrapper<EspacioDeportivo[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponse<EspacioDeportivo>> {
    return this.http.patch<ApiResponse<EspacioDeportivo>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponse<EspacioDeportivo>> {
    return this.http.delete<ApiResponse<EspacioDeportivo>>(`${this.api}/${id}`, { headers: this.headers });
  }
}
