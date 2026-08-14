import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Instalacion } from '../models/instalacion';
import { AUTH } from '../auth/auth.constants';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { buildHttpParams } from '../utils/params.util';
import { Pavimento } from '../models/pavimento';


@Injectable({
  providedIn: 'root'
})
export class InstalacionService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/instalaciones`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener todos las instalaciones
   */
  getAll(filtros?: any): Observable<ApiResponseWrapper<Instalacion[]>> {
    return this.http.get<ApiResponseWrapper<Instalacion[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Obtener instalación
   */
  get(id: string): Observable<ApiResponseWrapper<Instalacion>> {
    return this.http.get<ApiResponseWrapper<Instalacion>>(`${this.api}/${id}`, {
      headers: this.headers
    });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponseWrapper<Pavimento>> {
    return this.http.patch<ApiResponseWrapper<Pavimento>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Cambia visibilidad de un registro
   * @param id Id del registro
   */
  cambiarVisible(id: number): Observable<ApiResponseWrapper<Instalacion>> {
    return this.http.patch<ApiResponseWrapper<Instalacion>>(`${this.api}/visibilidad/${id}`, null, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponseWrapper<Pavimento>> {
    return this.http.delete<ApiResponseWrapper<Pavimento>>(`${this.api}/${id}`, { headers: this.headers });
  }
}
