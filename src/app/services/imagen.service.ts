import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AUTH } from '../auth/auth.constants';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { buildHttpParams } from '../utils/params.util';
import { Imagen } from '../models/imagen';

@Injectable({
  providedIn: 'root',

})
export class ImagenService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/instalacionesgaleria`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener iluminaciones
   */
  getAll(filtros?: any): Observable<ApiResponseWrapper<Imagen[]>> {
    return this.http.get<ApiResponseWrapper<Imagen[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Obtener registro
   */
  descargar(nombre: string, filtros?: any): Observable<Blob> {
    return this.http.get(`${this.api}/images/${nombre}`, {
        params: buildHttpParams(filtros),
        responseType: 'blob'
    });
  }

  /**
   * Añadir registro
   * @param datos
   */
  addRegistro(datos: Imagen): Observable<ApiResponseWrapper<boolean>> {
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
