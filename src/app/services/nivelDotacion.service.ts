import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AUTH } from '../auth/auth.constants';
import { NivelDotacion } from '../models/niveldotacion';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { buildHttpParams } from '../utils/params.util';

@Injectable({
  providedIn: 'root'
})
export class NivelDotacionService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/nivelesdotaciones`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener todos registros
   */
  getAll(filtros?: any): Observable<ApiResponseWrapper<NivelDotacion[]>> {
    return this.http.get<ApiResponseWrapper<NivelDotacion[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Obtener registro
   */
  get(id: string): Observable<ApiResponseWrapper<NivelDotacion>> {
    return this.http.get<ApiResponseWrapper<NivelDotacion>>(`${this.api}/${id}`, { headers: this.headers });
  }

  /**
   * Añadir registro
   * @param datos
   */
  addRegistro(datos: NivelDotacion): Observable<ApiResponseWrapper<boolean>> {
    return this.http.post<ApiResponseWrapper<boolean>>(`${this.api}`, datos, { headers: this.headers });
  }

  /**
   * Actualizar registro
   * @param datos
   */
  updateRegistro(datos: NivelDotacion): Observable<ApiResponseWrapper<boolean>> {
    return this.http.put<ApiResponseWrapper<boolean>>(`${this.api}/${datos.id}`, datos, { headers: this.headers });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponseWrapper<NivelDotacion>> {
    return this.http.patch<ApiResponseWrapper<NivelDotacion>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponseWrapper<NivelDotacion>> {
    return this.http.delete<ApiResponseWrapper<NivelDotacion>>(`${this.api}/${id}`, { headers: this.headers });
  }

}
