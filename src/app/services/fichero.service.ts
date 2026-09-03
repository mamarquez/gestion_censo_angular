import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AUTH } from '../auth/auth.constants';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { buildHttpParams } from '../utils/params.util';
import { Fichero } from '../models/fichero';

@Injectable({
  providedIn: 'root',

})
export class FicheroService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/instalacionesficheros`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener ficheros
   */
  getAll(filtros?: any): Observable<ApiResponseWrapper<Fichero[]>> {
    return this.http.get<ApiResponseWrapper<Fichero[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Obtener registro
   */
  descargar(nombre: string, filtros?: any): Observable<Blob> {
    return this.http.get(`${this.api}/ficheros/${nombre}`, {
        params: buildHttpParams(filtros),
        responseType: 'blob'
    });
  }

  /**
   * Añadir registro
   * @param datos
   */
  addRegistro(datos: Fichero): Observable<ApiResponseWrapper<boolean>> {
    return this.http.post<ApiResponseWrapper<boolean>>(`${this.api}`, datos, { headers: this.headers });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponseWrapper<boolean>> {
    return this.http.patch<ApiResponseWrapper<boolean>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponseWrapper<boolean>> {
    return this.http.delete<ApiResponseWrapper<boolean>>(`${this.api}/${id}`, { headers: this.headers });
  }
}
