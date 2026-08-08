import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Iluminacion } from '../models/iluminacion';
import { AUTH } from '../auth/auth.constants';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { buildHttpParams } from '../utils/params.util';

@Injectable({
  providedIn: 'root'
})
export class IluminacionService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/iluminaciones`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener iluminaciones
   */
  getAll(filtros?: any): Observable<ApiResponseWrapper<Iluminacion[]>> {
    return this.http.get<ApiResponseWrapper<Iluminacion[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponseWrapper<Iluminacion>> {
    return this.http.patch<ApiResponseWrapper<Iluminacion>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponseWrapper<Iluminacion>> {
    return this.http.delete<ApiResponseWrapper<Iluminacion>>(`${this.api}/${id}`, { headers: this.headers });
  }
}
