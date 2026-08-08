import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AUTH } from '../auth/auth.constants';
import { Conservacion } from '../models/conservacion';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { buildHttpParams } from '../utils/params.util';


@Injectable({
  providedIn: 'root'
})
export class ConservacionService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/conservaciones`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener estado de conservación
   */
  getAll(filtros?: any): Observable<ApiResponseWrapper<Conservacion[]>> {
    return this.http.get<ApiResponseWrapper<Conservacion[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponseWrapper<Conservacion>> {
    return this.http.patch<ApiResponseWrapper<Conservacion>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponseWrapper<Conservacion>> {
    return this.http.delete<ApiResponseWrapper<Conservacion>>(`${this.api}/${id}`, { headers: this.headers });
  }
}
