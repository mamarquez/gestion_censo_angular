import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EstadoUso } from '../models/estadouso';
import { AUTH } from '../auth/auth.constants';
import { ApiResponse } from '../models/apiresponse';
import { NivelEducativo } from '../models/niveleducativo';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { buildHttpParams } from '../utils/params.util';

@Injectable({
  providedIn: 'root'
})
export class EstadoUsoService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/estadosusos`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener todos los niveles educativos
   */
  getAll(filtros?: any): Observable<ApiResponse<EstadoUso[]>> {
    return this.http.get<ApiResponseWrapper<EstadoUso[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponse<EstadoUso>> {
    return this.http.patch<ApiResponse<EstadoUso>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponse<EstadoUso>> {
    return this.http.delete<ApiResponse<EstadoUso>>(`${this.api}/${id}`, { headers: this.headers });
  }
}
