import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AUTH } from '../auth/auth.constants';
import { ApiResponse } from '../models/apiresponse';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { buildHttpParams } from '../utils/params.util';
import { NivelEducativo } from '../models/niveleducativo';

@Injectable({
  providedIn: 'root'
})
export class NivelEducativoService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/niveleseducativos`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener todos los niveles educativos
   */
  getAll(filtros?: any): Observable<ApiResponse<NivelEducativo[]>> {
    return this.http.get<ApiResponseWrapper<NivelEducativo[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponse<NivelEducativo>> {
    return this.http.patch<ApiResponse<NivelEducativo>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponse<NivelEducativo>> {
    return this.http.delete<ApiResponse<NivelEducativo>>(`${this.api}/${id}`, { headers: this.headers });
  }

}
